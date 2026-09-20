package skin_test

import (
	"bytes"
	"image"
	"image/color"
	"image/png"
	"testing"

	"mcskin/internal/skin"
)

func createTestPNG(width, height int) []byte {
	img := image.NewRGBA(image.Rect(0, 0, width, height))
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			img.Set(x, y, color.RGBA{R: 255, G: 0, B: 0, A: 255})
		}
	}
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		panic(err)
	}
	return buf.Bytes()
}

func TestValidateSkin_Valid64x64(t *testing.T) {
	data := createTestPNG(64, 64)
	info, err := skin.Validate(bytes.NewReader(data))
	if err != nil {
		t.Fatalf("expected valid 64x64 skin to pass, got: %v", err)
	}
	if info.Width != 64 || info.Height != 64 {
		t.Fatalf("expected dimensions 64x64, got %dx%d", info.Width, info.Height)
	}
}

func TestValidateSkin_Valid128x128(t *testing.T) {
	data := createTestPNG(128, 128)
	info, err := skin.Validate(bytes.NewReader(data))
	if err != nil {
		t.Fatalf("expected valid 128x128 skin to pass, got: %v", err)
	}
	if info.Width != 128 || info.Height != 128 {
		t.Fatalf("expected dimensions 128x128, got %dx%d", info.Width, info.Height)
	}
}

func TestValidate_64x32(t *testing.T) {
	data := createTestPNG(64, 32)
	info, err := skin.Validate(bytes.NewReader(data))
	if err != nil {
		t.Fatalf("expected valid 64x32 skin to pass, got: %v", err)
	}
	if info.Width != 64 || info.Height != 32 {
		t.Fatalf("expected dimensions 64x32, got %dx%d", info.Width, info.Height)
	}
}

func TestValidateSkin_InvalidDimensions(t *testing.T) {
	testCases := []struct {
		name   string
		width  int
		height int
	}{
		{"100x100", 100, 100},
		{"32x32", 32, 32},
		{"64x128", 64, 128},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			data := createTestPNG(tc.width, tc.height)
			_, err := skin.Validate(bytes.NewReader(data))
			if err == nil {
				t.Fatalf("expected error for dimension %dx%d, got nil", tc.width, tc.height)
			}
		})
	}
}

func TestValidateSkin_CorruptData(t *testing.T) {
	corruptData := []byte("this is not a valid png image header")
	_, err := skin.Validate(bytes.NewReader(corruptData))
	if err == nil {
		t.Fatalf("expected error for non-png data, got nil")
	}
}
