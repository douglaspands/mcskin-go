package converter_test

import (
	"archive/zip"
	"bytes"
	"image"
	"image/color"
	"image/png"
	"os"
	"path/filepath"
	"testing"

	"png-to-mcpack/internal/converter"
)

func writeTestSkinFile(t *testing.T, path string, width, height int) {
	img := image.NewRGBA(image.Rect(0, 0, width, height))
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			img.Set(x, y, color.RGBA{R: 0, G: 255, B: 0, A: 255})
		}
	}
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		t.Fatalf("failed to encode png: %v", err)
	}
	if err := os.WriteFile(path, buf.Bytes(), 0644); err != nil {
		t.Fatalf("failed to write test skin file: %v", err)
	}
}

func TestConvert_SameDirectoryAndBasename(t *testing.T) {
	tempDir := t.TempDir()
	skinPath := filepath.Join(tempDir, "player_skin.png")
	writeTestSkinFile(t, skinPath, 64, 64)

	expectedMcpackPath := filepath.Join(tempDir, "player_skin.mcpack")

	res, err := converter.Convert(converter.Options{
		InputPath: skinPath,
		Slim:      false,
		Overwrite: true,
	})
	if err != nil {
		t.Fatalf("unexpected conversion error: %v", err)
	}

	if res.OutputPath != expectedMcpackPath {
		t.Fatalf("expected output path %q, got %q", expectedMcpackPath, res.OutputPath)
	}

	info, err := os.Stat(expectedMcpackPath)
	if err != nil {
		t.Fatalf("expected mcpack file at %s: %v", expectedMcpackPath, err)
	}
	if info.Size() == 0 {
		t.Fatal("mcpack file is empty")
	}

	// Verify mcpack contents
	zr, err := zip.OpenReader(expectedMcpackPath)
	if err != nil {
		t.Fatalf("failed to open mcpack archive: %v", err)
	}
	defer zr.Close()

	hasManifest := false
	hasSkins := false
	hasLang := false
	hasTexture := false

	for _, f := range zr.File {
		switch f.Name {
		case "manifest.json":
			hasManifest = true
		case "skins.json":
			hasSkins = true
		case "texts/en_US.lang":
			hasLang = true
		case "player_skin.png":
			hasTexture = true
		}
	}

	if !hasManifest || !hasSkins || !hasLang || !hasTexture {
		t.Fatalf("mcpack archive missing required entries: manifest=%v, skins=%v, lang=%v, texture=%v",
			hasManifest, hasSkins, hasLang, hasTexture)
	}
}

func TestConvert_MissingInputFile(t *testing.T) {
	_, err := converter.Convert(converter.Options{
		InputPath: "/path/to/nonexistent/skin.png",
	})
	if err == nil {
		t.Fatal("expected error for nonexistent input file, got nil")
	}
}

func TestConvert_ExistingFileOverwrite(t *testing.T) {
	tempDir := t.TempDir()
	skinPath := filepath.Join(tempDir, "duplicate.png")
	writeTestSkinFile(t, skinPath, 64, 64)

	mcpackPath := filepath.Join(tempDir, "duplicate.mcpack")
	if err := os.WriteFile(mcpackPath, []byte("pre-existing content"), 0644); err != nil {
		t.Fatalf("failed to pre-create mcpack file: %v", err)
	}

	// With Overwrite=false, should fail
	_, err := converter.Convert(converter.Options{
		InputPath: skinPath,
		Overwrite: false,
	})
	if err == nil {
		t.Fatal("expected error when target exists and Overwrite is false, got nil")
	}

	// With Overwrite=true, should succeed
	res, err := converter.Convert(converter.Options{
		InputPath: skinPath,
		Overwrite: true,
	})
	if err != nil {
		t.Fatalf("expected overwrite to succeed, got: %v", err)
	}
	if res.OutputPath != mcpackPath {
		t.Fatalf("expected output path %s, got %s", mcpackPath, res.OutputPath)
	}
}
