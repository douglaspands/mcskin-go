package pack

import (
	"archive/zip"
	"fmt"
	"os"
	"path/filepath"
)

// CreateMCPack writes a zip-compressed .mcpack archive to targetPath containing
// manifest.json, skins.json, texts/en_US.lang, and the skin texture file.
func CreateMCPack(targetPath string, manifestData, skinsData, langData, textureData []byte, textureFilename string) error {
	// Ensure parent directory exists
	parentDir := filepath.Dir(targetPath)
	if err := os.MkdirAll(parentDir, 0755); err != nil {
		return fmt.Errorf("failed to create directory %s: %w", parentDir, err)
	}

	outFile, err := os.Create(targetPath)
	if err != nil {
		return fmt.Errorf("failed to create mcpack file %s: %w", targetPath, err)
	}
	defer outFile.Close()

	zw := zip.NewWriter(outFile)
	defer zw.Close()

	entries := []struct {
		name string
		data []byte
	}{
		{"manifest.json", manifestData},
		{"skins.json", skinsData},
		{"texts/en_US.lang", langData},
		{filepath.ToSlash(textureFilename), textureData},
	}

	for _, entry := range entries {
		w, err := zw.Create(entry.name)
		if err != nil {
			return fmt.Errorf("failed to create zip entry %s: %w", entry.name, err)
		}
		if _, err := w.Write(entry.data); err != nil {
			return fmt.Errorf("failed to write data for zip entry %s: %w", entry.name, err)
		}
	}

	return nil
}
