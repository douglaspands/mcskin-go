package pack_test

import (
	"archive/zip"
	"io"
	"os"
	"path/filepath"
	"testing"

	"png-to-mcpack/internal/pack"
)

func TestCreateMCPack(t *testing.T) {
	tempDir := t.TempDir()
	outputPath := filepath.Join(tempDir, "test.mcpack")

	manifestData := []byte(`{"format_version": 2}`)
	skinsData := []byte(`{"skins": []}`)
	langData := []byte(`skinpack.test=Test`)
	textureData := []byte("fake-png-bytes")
	textureFilename := "test_skin.png"

	err := pack.CreateMCPack(outputPath, manifestData, skinsData, langData, textureData, textureFilename)
	if err != nil {
		t.Fatalf("unexpected error creating mcpack: %v", err)
	}

	info, err := os.Stat(outputPath)
	if err != nil {
		t.Fatalf("mcpack file was not created: %v", err)
	}
	if info.Size() == 0 {
		t.Fatal("mcpack file is empty")
	}

	reader, err := zip.OpenReader(outputPath)
	if err != nil {
		t.Fatalf("failed to open mcpack as zip archive: %v", err)
	}
	defer reader.Close()

	expectedEntries := map[string][]byte{
		"manifest.json":      manifestData,
		"skins.json":         skinsData,
		"texts/en_US.lang":   langData,
		textureFilename:      textureData,
	}

	foundEntries := make(map[string]bool)

	for _, file := range reader.File {
		foundEntries[file.Name] = true
		expectedData, exists := expectedEntries[file.Name]
		if !exists {
			t.Errorf("unexpected entry in zip archive: %s", file.Name)
			continue
		}

		rc, err := file.Open()
		if err != nil {
			t.Fatalf("failed to open entry %s: %v", file.Name, err)
		}
		content, err := io.ReadAll(rc)
		rc.Close()
		if err != nil {
			t.Fatalf("failed to read entry %s: %v", file.Name, err)
		}

		if string(content) != string(expectedData) {
			t.Errorf("content mismatch for %s: expected %q, got %q", file.Name, string(expectedData), string(content))
		}
	}

	for expected := range expectedEntries {
		if !foundEntries[expected] {
			t.Errorf("missing expected entry in zip: %s", expected)
		}
	}
}
