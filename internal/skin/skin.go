package skin

import (
	"errors"
	"fmt"
	"image/png"
	"io"
)

var (
	// ErrInvalidPNG is returned when image decoding fails.
	ErrInvalidPNG = errors.New("input file is not a valid PNG image")

	// ErrInvalidDimensions is returned when dimensions do not match Minecraft skin standards.
	ErrInvalidDimensions = errors.New("invalid skin dimensions: skin must be 64x64 or 128x128 pixels")
)

// SkinInfo holds metadata for a validated Minecraft skin.
type SkinInfo struct {
	Width  int
	Height int
}

// Validate checks that the input reader contains valid PNG data with dimensions of 64x64 or 128x128.
func Validate(r io.Reader) (*SkinInfo, error) {
	cfg, err := png.DecodeConfig(r)
	if err != nil {
		return nil, fmt.Errorf("%w: %v", ErrInvalidPNG, err)
	}

	if (cfg.Width == 64 && cfg.Height == 64) || (cfg.Width == 128 && cfg.Height == 128) {
		return &SkinInfo{
			Width:  cfg.Width,
			Height: cfg.Height,
		}, nil
	}

	return nil, fmt.Errorf("%w: got %dx%d", ErrInvalidDimensions, cfg.Width, cfg.Height)
}
