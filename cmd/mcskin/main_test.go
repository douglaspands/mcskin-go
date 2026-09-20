package main

import (
	"bytes"
	"image"
	"image/color"
	"image/png"
	"io"
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
	if !strings.Contains(stderr.String(), "Usage") && !strings.Contains(stderr.String(), "mcskin") {
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

func TestRun_VersionFlag(t *testing.T) {
	var stdout, stderr bytes.Buffer
	code := run([]string{"--version"}, &stdout, &stderr)
	if code != 0 {
		t.Errorf("expected exit code 0 for --version, got %d", code)
	}
	if !strings.Contains(stdout.String(), "mcskin version") {
		t.Errorf("expected version info in stdout, got: %s", stdout.String())
	}

	stdout.Reset()
	codeShort := run([]string{"-v"}, &stdout, &stderr)
	if codeShort != 0 {
		t.Errorf("expected exit code 0 for -v, got %d", codeShort)
	}
	if !strings.Contains(stdout.String(), "mcskin version") {
		t.Errorf("expected version info in stdout for -v, got: %s", stdout.String())
	}
}

func TestRun_DefaultBothModels(t *testing.T) {
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
	if !strings.Contains(stdout.String(), "both") {
		t.Errorf("expected output to mention 'both' models, got: %s", stdout.String())
	}
}

func TestRun_ClassicFlag(t *testing.T) {
	tempDir := t.TempDir()
	skinPath := filepath.Join(tempDir, "steve.png")
	writeTestPNG(t, skinPath)

	var stdout, stderr bytes.Buffer
	code := run([]string{"--classic", skinPath}, &stdout, &stderr)
	if code != 0 {
		t.Fatalf("expected exit code 0 with --classic, got %d. stderr: %s", code, stderr.String())
	}

	expectedMcpack := filepath.Join(tempDir, "steve.mcpack")
	if _, err := os.Stat(expectedMcpack); err != nil {
		t.Fatalf("expected mcpack file at %s: %v", expectedMcpack, err)
	}
	if !strings.Contains(stdout.String(), "classic") {
		t.Errorf("expected output to mention classic, got: %s", stdout.String())
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
	if !strings.Contains(stdout.String(), "slim") {
		t.Errorf("expected output to mention slim, got: %s", stdout.String())
	}
}

func TestRun_BothFlagExplicit(t *testing.T) {
	tempDir := t.TempDir()
	skinPath := filepath.Join(tempDir, "dual.png")
	writeTestPNG(t, skinPath)

	var stdout, stderr bytes.Buffer
	code := run([]string{"--both", skinPath}, &stdout, &stderr)
	if code != 0 {
		t.Fatalf("expected exit code 0 with --both, got %d. stderr: %s", code, stderr.String())
	}

	if !strings.Contains(stdout.String(), "both") {
		t.Errorf("expected output to mention both, got: %s", stdout.String())
	}
}

func TestRun_MutuallyExclusiveFlags(t *testing.T) {
	tempDir := t.TempDir()
	skinPath := filepath.Join(tempDir, "conflict.png")
	writeTestPNG(t, skinPath)

	var stdout, stderr bytes.Buffer
	code := run([]string{"--classic", "--slim", skinPath}, &stdout, &stderr)
	if code == 0 {
		t.Errorf("expected error exit code when --classic and --slim are passed together, got 0")
	}
	if !strings.Contains(stderr.String(), "cannot be used together") && !strings.Contains(stderr.String(), "mutually exclusive") {
		t.Errorf("expected mutually exclusive error message in stderr, got: %s", stderr.String())
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

func TestRun_WebFlag(t *testing.T) {
	origRunner := webServerRunner
	defer func() { webServerRunner = origRunner }()

	var capturedPort int
	var capturedOpenBrowser bool
	webServerRunner = func(port int, openBrowser bool, stdout, stderr io.Writer) int {
		capturedPort = port
		capturedOpenBrowser = openBrowser
		return 0
	}

	var stdout, stderr bytes.Buffer
	code := run([]string{"--web", "--port", "9090", "--no-browser"}, &stdout, &stderr)
	if code != 0 {
		t.Fatalf("expected code 0, got %d", code)
	}
	if capturedPort != 9090 {
		t.Errorf("expected port 9090, got %d", capturedPort)
	}
	if capturedOpenBrowser {
		t.Errorf("expected openBrowser false with --no-browser, got true")
	}
}

func TestRun_WindowsNoArgs_LaunchesWeb(t *testing.T) {
	origOS := currentOS
	origRunner := webServerRunner
	defer func() {
		currentOS = origOS
		webServerRunner = origRunner
	}()

	currentOS = "windows"
	var launched bool
	webServerRunner = func(port int, openBrowser bool, stdout, stderr io.Writer) int {
		launched = true
		if port != 8080 {
			t.Errorf("expected default port 8080, got %d", port)
		}
		if !openBrowser {
			t.Errorf("expected openBrowser true on Windows double-click, got false")
		}
		return 0
	}

	var stdout, stderr bytes.Buffer
	code := run([]string{}, &stdout, &stderr)
	if code != 0 {
		t.Fatalf("expected code 0 on Windows no-args, got %d", code)
	}
	if !launched {
		t.Error("expected web server to launch on Windows with zero args")
	}
}

func TestRun_NonWindowsNoArgs_ShowsUsage(t *testing.T) {
	origOS := currentOS
	defer func() { currentOS = origOS }()
	currentOS = "linux"

	var stdout, stderr bytes.Buffer
	code := run([]string{}, &stdout, &stderr)
	if code == 0 {
		t.Errorf("expected non-zero exit code on Linux with no args, got 0")
	}
	if !strings.Contains(stderr.String(), "Usage") {
		t.Errorf("expected usage output, got: %s", stderr.String())
	}
}

