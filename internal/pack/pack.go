package pack

import (
	"archive/zip"
	"fmt"
	"io"
	"os"
	"path/filepath"
)

// WriteMCPack streams the .mcpack zip archive directly into an io.Writer.
// This enables fully isolated in-memory unit testing without filesystem access.
func WriteMCPack(w io.Writer, manifestData, skinsData, langData, textureData []byte, textureFilename string) error {
	zw := zip.NewWriter(w)

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
		writer, err := zw.Create(entry.name)
		if err != nil {
			return fmt.Errorf("failed to create zip entry %s: %w", entry.name, err)
		}
		if _, err := writer.Write(entry.data); err != nil {
			return fmt.Errorf("failed to write data for zip entry %s: %w", entry.name, err)
		}
	}

	if err := zw.Close(); err != nil {
		return fmt.Errorf("failed to finalize zip archive: %w", err)
	}

	return nil
}

// CreateMCPack writes a zip-compressed .mcpack archive to targetPath containing
// manifest.json, skins.json, texts/en_US.lang, and the skin texture file.
func CreateMCPack(targetPath string, manifestData, skinsData, langData, textureData []byte, textureFilename string) error {
	parentDir := filepath.Dir(targetPath)
	if err := os.MkdirAll(parentDir, 0755); err != nil {
		return fmt.Errorf("failed to create directory %s: %w", parentDir, err)
	}

	outFile, err := os.Create(targetPath)
	if err != nil {
		return fmt.Errorf("failed to create mcpack file %s: %w", targetPath, err)
	}
	defer outFile.Close()

	if err := WriteMCPack(outFile, manifestData, skinsData, langData, textureData, textureFilename); err != nil {
		return fmt.Errorf("failed to write mcpack archive to %s: %w", targetPath, err)
	}

	return nil
}
