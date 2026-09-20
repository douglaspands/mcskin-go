package converter_test

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"image"
	"image/color"
	"image/png"
	"io"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"mcskin/internal/bedrock"
	"mcskin/internal/converter"
)

func createTestSkinPNG(t *testing.T, width, height int) []byte {
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
	return buf.Bytes()
}

func writeTestSkinFile(t *testing.T, path string, width, height int) {
	data := createTestSkinPNG(t, width, height)
	if err := os.WriteFile(path, data, 0644); err != nil {
		t.Fatalf("failed to write test skin file: %v", err)
	}
}

func readZipEntry(t *testing.T, zr *zip.ReadCloser, name string) []byte {
	for _, f := range zr.File {
		if f.Name == name {
			rc, err := f.Open()
			if err != nil {
				t.Fatalf("failed to open zip entry %s: %v", name, err)
			}
			defer rc.Close()
			data, err := io.ReadAll(rc)
			if err != nil {
				t.Fatalf("failed to read zip entry %s: %v", name, err)
			}
			return data
		}
	}
	t.Fatalf("zip entry not found: %s", name)
	return nil
}

func TestConvert_DefaultDualModel(t *testing.T) {
	tempDir := t.TempDir()
	skinPath := filepath.Join(tempDir, "player_skin.png")
	writeTestSkinFile(t, skinPath, 64, 64)

	expectedMcpackPath := filepath.Join(tempDir, "player_skin.mcpack")

	res, err := converter.Convert(converter.Options{
		InputPath: skinPath,
		Overwrite: true,
	})
	if err != nil {
		t.Fatalf("unexpected conversion error: %v", err)
	}

	if res.OutputPath != expectedMcpackPath {
		t.Fatalf("expected output path %q, got %q", expectedMcpackPath, res.OutputPath)
	}
	if res.Model != bedrock.ModelModeBoth {
		t.Errorf("expected result model to be %q, got %q", bedrock.ModelModeBoth, res.Model)
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

	skinsBytes := readZipEntry(t, zr, "skins.json")
	var skinsCfg bedrock.SkinsConfig
	if err := json.Unmarshal(skinsBytes, &skinsCfg); err != nil {
		t.Fatalf("failed to unmarshal skins.json: %v", err)
	}

	if len(skinsCfg.Skins) != 2 {
		t.Fatalf("expected 2 skin entries in dual-model pack, got %d", len(skinsCfg.Skins))
	}
	if skinsCfg.Skins[0].Geometry != "geometry.humanoid.custom" {
		t.Errorf("expected first skin geometry classic, got %s", skinsCfg.Skins[0].Geometry)
	}
	if skinsCfg.Skins[1].Geometry != "geometry.humanoid.customSlim" {
		t.Errorf("expected second skin geometry slim, got %s", skinsCfg.Skins[1].Geometry)
	}
	if skinsCfg.Skins[0].Texture != "player_skin.png" || skinsCfg.Skins[1].Texture != "player_skin.png" {
		t.Errorf("both skins should reference player_skin.png")
	}

	langBytes := readZipEntry(t, zr, "texts/en_US.lang")
	langStr := string(langBytes)
	if !strings.Contains(langStr, "player_skin_classic") || !strings.Contains(langStr, "player_skin_slim") {
		t.Errorf("expected lang to contain classic and slim entries, got: %s", langStr)
	}
}

func TestConvert_SingleModelOverrides(t *testing.T) {
	tempDir := t.TempDir()
	skinPath := filepath.Join(tempDir, "override.png")
	writeTestSkinFile(t, skinPath, 64, 64)

	// Test Classic override
	resClassic, err := converter.Convert(converter.Options{
		InputPath: skinPath,
		Model:     bedrock.ModelModeClassic,
		Overwrite: true,
	})
	if err != nil {
		t.Fatalf("unexpected classic conversion error: %v", err)
	}
	if resClassic.Model != bedrock.ModelModeClassic {
		t.Errorf("expected model %q, got %q", bedrock.ModelModeClassic, resClassic.Model)
	}

	zrClassic, err := zip.OpenReader(resClassic.OutputPath)
	if err != nil {
		t.Fatalf("failed to open mcpack: %v", err)
	}
	defer zrClassic.Close()

	var skinsCfgClassic bedrock.SkinsConfig
	if err := json.Unmarshal(readZipEntry(t, zrClassic, "skins.json"), &skinsCfgClassic); err != nil {
		t.Fatalf("failed to unmarshal skins.json: %v", err)
	}
	if len(skinsCfgClassic.Skins) != 1 {
		t.Fatalf("expected 1 skin entry for classic override, got %d", len(skinsCfgClassic.Skins))
	}
	if skinsCfgClassic.Skins[0].Geometry != "geometry.humanoid.custom" {
		t.Errorf("expected classic geometry, got %s", skinsCfgClassic.Skins[0].Geometry)
	}

	// Test Slim override
	resSlim, err := converter.Convert(converter.Options{
		InputPath: skinPath,
		Model:     bedrock.ModelModeSlim,
		Overwrite: true,
	})
	if err != nil {
		t.Fatalf("unexpected slim conversion error: %v", err)
	}
	if resSlim.Model != bedrock.ModelModeSlim {
		t.Errorf("expected model %q, got %q", bedrock.ModelModeSlim, resSlim.Model)
	}

	zrSlim, err := zip.OpenReader(resSlim.OutputPath)
	if err != nil {
		t.Fatalf("failed to open mcpack: %v", err)
	}
	defer zrSlim.Close()

	var skinsCfgSlim bedrock.SkinsConfig
	if err := json.Unmarshal(readZipEntry(t, zrSlim, "skins.json"), &skinsCfgSlim); err != nil {
		t.Fatalf("failed to unmarshal skins.json: %v", err)
	}
	if len(skinsCfgSlim.Skins) != 1 {
		t.Fatalf("expected 1 skin entry for slim override, got %d", len(skinsCfgSlim.Skins))
	}
	if skinsCfgSlim.Skins[0].Geometry != "geometry.humanoid.customSlim" {
		t.Errorf("expected slim geometry, got %s", skinsCfgSlim.Skins[0].Geometry)
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

func TestConvertBytes_Success(t *testing.T) {
	pngData := createTestSkinPNG(t, 64, 64)
	mcpackBytes, err := converter.ConvertBytes("hero_skin", pngData, bedrock.ModelModeBoth)
	if err != nil {
		t.Fatalf("unexpected error from ConvertBytes: %v", err)
	}
	if len(mcpackBytes) == 0 {
		t.Fatal("expected non-empty mcpack bytes")
	}

	zr, err := zip.NewReader(bytes.NewReader(mcpackBytes), int64(len(mcpackBytes)))
	if err != nil {
		t.Fatalf("failed to read zip from bytes: %v", err)
	}

	foundManifest := false
	foundSkins := false
	foundTexture := false
	for _, f := range zr.File {
		if f.Name == "manifest.json" {
			foundManifest = true
		}
		if f.Name == "skins.json" {
			foundSkins = true
		}
		if f.Name == "hero_skin.png" {
			foundTexture = true
		}
	}
	if !foundManifest || !foundSkins || !foundTexture {
		t.Errorf("missing expected files in mcpack zip: manifest=%v, skins=%v, texture=%v", foundManifest, foundSkins, foundTexture)
	}
}

func TestConvertBytes_InvalidPNG(t *testing.T) {
	_, err := converter.ConvertBytes("bad_skin", []byte("not a png"), bedrock.ModelModeBoth)
	if err == nil {
		t.Fatal("expected error for invalid png data, got nil")
	}
}

func TestConvertBytes_InvalidDimensions(t *testing.T) {
	pngData := createTestSkinPNG(t, 32, 32)
	_, err := converter.ConvertBytes("bad_dim", pngData, bedrock.ModelModeBoth)
	if err == nil {
		t.Fatal("expected error for 32x32 dimensions, got nil")
	}
}

func TestConvert_Valid64x32(t *testing.T) {
	tempDir := t.TempDir()
	skinPath := filepath.Join(tempDir, "classic_steve.png")
	writeTestSkinFile(t, skinPath, 64, 32)

	expectedMcpackPath := filepath.Join(tempDir, "classic_steve.mcpack")

	res, err := converter.Convert(converter.Options{
		InputPath: skinPath,
		Overwrite: true,
	})
	if err != nil {
		t.Fatalf("unexpected conversion error for 64x32 skin: %v", err)
	}

	if res.OutputPath != expectedMcpackPath {
		t.Fatalf("expected output path %q, got %q", expectedMcpackPath, res.OutputPath)
	}

	// Verify mcpack contents
	zr, err := zip.OpenReader(expectedMcpackPath)
	if err != nil {
		t.Fatalf("failed to open mcpack archive: %v", err)
	}
	defer zr.Close()

	skinsBytes := readZipEntry(t, zr, "skins.json")
	var skinsCfg bedrock.SkinsConfig
	if err := json.Unmarshal(skinsBytes, &skinsCfg); err != nil {
		t.Fatalf("failed to unmarshal skins.json: %v", err)
	}

	if len(skinsCfg.Skins) == 0 {
		t.Fatal("expected at least 1 skin entry in skins.json")
	}
}

