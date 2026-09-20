package main

import (
	"bytes"
	"image"
	"image/color"
	"image/png"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func writeTestPNG(t *testing.T, path string) {
	img := image.NewRGBA(image.Rect(0, 0, 64, 64))
	for y := 0; y < 64; y++ {
		for x := 0; x < 64; x++ {
			img.Set(x, y, color.RGBA{R: 255, G: 255, B: 0, A: 255})
		}
	}
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		t.Fatalf("failed to encode test png: %v", err)
	}
	if err := os.WriteFile(path, buf.Bytes(), 0644); err != nil {
		t.Fatalf("failed to write test png: %v", err)
	}
}

func TestRun_NoArgs(t *testing.T) {
	var stdout, stderr bytes.Buffer
	code := run([]string{}, &stdout, &stderr)
	if code == 0 {
		t.Errorf("expected non-zero exit code when no arguments provided, got %d", code)
	}
	if !strings.Contains(stderr.String(), "Usage") && !strings.Contains(stderr.String(), "png-to-mcpack") {
		t.Errorf("expected usage instructions in stderr, got: %s", stderr.String())
	}
}

func TestRun_HelpFlag(t *testing.T) {
	var stdout, stderr bytes.Buffer
	code := run([]string{"--help"}, &stdout, &stderr)
	if code != 0 {
		t.Errorf("expected exit code 0 for --help, got %d", code)
	}
	if !strings.Contains(stdout.String(), "Usage") {
		t.Errorf("expected usage instructions in stdout, got: %s", stdout.String())
	}
}

func TestRun_ValidFile(t *testing.T) {
	tempDir := t.TempDir()
	skinPath := filepath.Join(tempDir, "hero.png")
	writeTestPNG(t, skinPath)

	var stdout, stderr bytes.Buffer
	code := run([]string{skinPath}, &stdout, &stderr)
	if code != 0 {
		t.Fatalf("expected exit code 0, got %d. stderr: %s", code, stderr.String())
	}

	expectedMcpack := filepath.Join(tempDir, "hero.mcpack")
	if _, err := os.Stat(expectedMcpack); err != nil {
		t.Fatalf("expected mcpack file at %s: %v", expectedMcpack, err)
	}

	if !strings.Contains(stdout.String(), "hero.mcpack") {
		t.Errorf("expected output to mention created mcpack, got: %s", stdout.String())
	}
}

func TestRun_SlimFlag(t *testing.T) {
	tempDir := t.TempDir()
	skinPath := filepath.Join(tempDir, "alex.png")
	writeTestPNG(t, skinPath)

	var stdout, stderr bytes.Buffer
	code := run([]string{"--slim", skinPath}, &stdout, &stderr)
	if code != 0 {
		t.Fatalf("expected exit code 0 with --slim, got %d. stderr: %s", code, stderr.String())
	}

	expectedMcpack := filepath.Join(tempDir, "alex.mcpack")
	if _, err := os.Stat(expectedMcpack); err != nil {
		t.Fatalf("expected mcpack file at %s: %v", expectedMcpack, err)
	}
}

func TestRun_NonexistentFile(t *testing.T) {
	var stdout, stderr bytes.Buffer
	code := run([]string{"/nonexistent/file.png"}, &stdout, &stderr)
	if code == 0 {
		t.Errorf("expected non-zero exit code for nonexistent file, got %d", code)
	}
	if stderr.Len() == 0 {
		t.Error("expected error message in stderr, got none")
	}
}
