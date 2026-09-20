package converter

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"png-to-mcpack/internal/bedrock"
	"png-to-mcpack/internal/pack"
	"png-to-mcpack/internal/skin"
)

// Options holds parameters for a conversion execution.
type Options struct {
	InputPath string
	Slim      bool
	Overwrite bool
}

// Result contains metadata about the converted .mcpack package.
type Result struct {
	OutputPath string
	OutputSize int64
	SkinName   string
	Slim       bool
}

// Convert processes an input PNG skin and generates a compliant .mcpack in the same folder.
func Convert(opts Options) (*Result, error) {
	if strings.TrimSpace(opts.InputPath) == "" {
		return nil, errors.New("input file path cannot be empty")
	}

	cleanInput := filepath.Clean(opts.InputPath)
	fileInfo, err := os.Stat(cleanInput)
	if err != nil {
		return nil, fmt.Errorf("failed to access input file %s: %w", cleanInput, err)
	}
	if fileInfo.IsDir() {
		return nil, fmt.Errorf("input path is a directory, not a file: %s", cleanInput)
	}

	dir := filepath.Dir(cleanInput)
	filename := filepath.Base(cleanInput)
	ext := filepath.Ext(filename)
	skinName := strings.TrimSuffix(filename, ext)
	outputPath := filepath.Join(dir, skinName+".mcpack")

	// Check for existing output file collision
	if _, err := os.Stat(outputPath); err == nil {
		if !opts.Overwrite {
			return nil, fmt.Errorf("target file already exists: %s (enable overwrite to replace)", outputPath)
		}
	}

	// Read input texture
	textureData, err := os.ReadFile(cleanInput)
	if err != nil {
		return nil, fmt.Errorf("failed to read input file: %w", err)
	}

	// Validate PNG format and dimensions
	if _, err := skin.Validate(bytes.NewReader(textureData)); err != nil {
		return nil, fmt.Errorf("skin validation failed: %w", err)
	}

	// Generate unique identifiers
	headerUUID, err := bedrock.NewUUID()
	if err != nil {
		return nil, fmt.Errorf("failed to generate header UUID: %w", err)
	}
	moduleUUID, err := bedrock.NewUUID()
	if err != nil {
		return nil, fmt.Errorf("failed to generate module UUID: %w", err)
	}

	// Build metadata
	manifest, err := bedrock.GenerateManifest(skinName, "Converted by png-to-mcpack", headerUUID, moduleUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to build manifest: %w", err)
	}
	manifestBytes, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("failed to marshal manifest: %w", err)
	}

	skinsCfg, err := bedrock.GenerateSkinsJSON(skinName, filename, opts.Slim)
	if err != nil {
		return nil, fmt.Errorf("failed to build skins.json: %w", err)
	}
	skinsBytes, err := json.MarshalIndent(skinsCfg, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("failed to marshal skins.json: %w", err)
	}

	langBytes := []byte(bedrock.GenerateLang(skinName))

	// Package into .mcpack zip archive
	if err := pack.CreateMCPack(outputPath, manifestBytes, skinsBytes, langBytes, textureData, filename); err != nil {
		return nil, fmt.Errorf("failed to create mcpack archive: %w", err)
	}

	stat, err := os.Stat(outputPath)
	if err != nil {
		return nil, fmt.Errorf("failed to stat generated mcpack: %w", err)
	}

	return &Result{
		OutputPath: outputPath,
		OutputSize: stat.Size(),
		SkinName:   skinName,
		Slim:       opts.Slim,
	}, nil
}
