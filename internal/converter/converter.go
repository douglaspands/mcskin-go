package converter

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"mcskin/internal/bedrock"
	"mcskin/internal/pack"
	"mcskin/internal/skin"
)

// Options holds parameters for a conversion execution.
type Options struct {
	InputPath string
	Model     bedrock.ModelMode // Defaults to ModelModeBoth if empty
	Slim      bool              // Kept for backwards compatibility
	Overwrite bool
}

// Result contains metadata about the converted .mcpack package.
type Result struct {
	OutputPath string
	OutputSize int64
	SkinName   string
	Model      bedrock.ModelMode
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

	// Resolve model mode
	modelMode := opts.Model
	if modelMode == "" {
		if opts.Slim {
			modelMode = bedrock.ModelModeSlim
		} else {
			modelMode = bedrock.ModelModeBoth
		}
	}

	mcpackBytes, err := ConvertBytes(skinName, textureData, modelMode)
	if err != nil {
		return nil, err
	}

	parentDir := filepath.Dir(outputPath)
	if err := os.MkdirAll(parentDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create directory %s: %w", parentDir, err)
	}

	if err := os.WriteFile(outputPath, mcpackBytes, 0644); err != nil {
		return nil, fmt.Errorf("failed to write mcpack archive to %s: %w", outputPath, err)
	}

	return &Result{
		OutputPath: outputPath,
		OutputSize: int64(len(mcpackBytes)),
		SkinName:   skinName,
		Model:      modelMode,
		Slim:       modelMode == bedrock.ModelModeSlim,
	}, nil
}

// ConvertBytes processes raw PNG skin bytes in-memory and returns a valid .mcpack zip archive.
func ConvertBytes(skinName string, textureData []byte, model bedrock.ModelMode) ([]byte, error) {
	if strings.TrimSpace(skinName) == "" {
		skinName = "custom_skin"
	}

	// Validate PNG format and dimensions
	if _, err := skin.Validate(bytes.NewReader(textureData)); err != nil {
		return nil, fmt.Errorf("skin validation failed: %w", err)
	}

	modelMode := model
	if modelMode == "" {
		modelMode = bedrock.ModelModeBoth
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
	manifest, err := bedrock.GenerateManifest(skinName, "Converted by mcskin", headerUUID, moduleUUID)
	if err != nil {
		return nil, fmt.Errorf("failed to build manifest: %w", err)
	}
	manifestBytes, err := json.MarshalIndent(manifest, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("failed to marshal manifest: %w", err)
	}

	textureFilename := skinName + ".png"
	skinsCfg, err := bedrock.GenerateSkinsJSON(skinName, textureFilename, modelMode)
	if err != nil {
		return nil, fmt.Errorf("failed to build skins.json: %w", err)
	}
	skinsBytes, err := json.MarshalIndent(skinsCfg, "", "  ")
	if err != nil {
		return nil, fmt.Errorf("failed to marshal skins.json: %w", err)
	}

	langBytes := []byte(bedrock.GenerateLang(skinName, modelMode))

	var buf bytes.Buffer
	if err := pack.WriteMCPack(&buf, manifestBytes, skinsBytes, langBytes, textureData, textureFilename); err != nil {
		return nil, fmt.Errorf("failed to create mcpack archive: %w", err)
	}

	return buf.Bytes(), nil
}

