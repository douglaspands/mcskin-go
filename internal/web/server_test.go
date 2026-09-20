package web_test

import (
	"archive/zip"
	"bytes"
	"encoding/json"
	"image"
	"image/color"
	"image/png"
	"io/fs"
	"mime/multipart"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"testing/fstest"

	"mcskin/internal/web"
)

func createTestPNG(t *testing.T, width, height int) []byte {
	img := image.NewRGBA(image.Rect(0, 0, width, height))
	for y := 0; y < height; y++ {
		for x := 0; x < width; x++ {
			img.Set(x, y, color.RGBA{R: 255, G: 0, B: 0, A: 255})
		}
	}
	var buf bytes.Buffer
	if err := png.Encode(&buf, img); err != nil {
		t.Fatalf("failed to encode test png: %v", err)
	}
	return buf.Bytes()
}

func TestHandleInfo(t *testing.T) {
	mockProvider := func() ([]net.Addr, error) {
		return []net.Addr{
			mockAddr{ipStr: "192.168.1.25/24"},
		}, nil
	}

	handler := web.NewHandler(web.Config{
		Port:          8080,
		AddrsProvider: mockProvider,
		StaticFS:      fstest.MapFS{"index.html": &fstest.MapFile{Data: []byte("<h1>CRIE SKINS LEGAIS</h1>")}},
	})

	req := httptest.NewRequest(http.MethodGet, "/api/info", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d", rec.Code)
	}

	var info web.ServerInfo
	if err := json.Unmarshal(rec.Body.Bytes(), &info); err != nil {
		t.Fatalf("failed to parse JSON info response: %v", err)
	}

	if info.Port != 8080 {
		t.Errorf("expected port 8080, got %d", info.Port)
	}
	if info.LocalURL != "http://localhost:8080" {
		t.Errorf("expected localUrl http://localhost:8080, got %s", info.LocalURL)
	}
	if len(info.NetworkURLs) != 1 || info.NetworkURLs[0] != "http://192.168.1.25:8080" {
		t.Errorf("expected networkUrl http://192.168.1.25:8080, got %v", info.NetworkURLs)
	}
}

func TestHandleConvert_Success(t *testing.T) {
	pngData := createTestPNG(t, 64, 64)

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	part, err := writer.CreateFormFile("skin", "cool_skin.png")
	if err != nil {
		t.Fatalf("failed to create form file: %v", err)
	}
	if _, err := part.Write(pngData); err != nil {
		t.Fatalf("failed to write png data: %v", err)
	}

	if err := writer.WriteField("name", "cool_skin"); err != nil {
		t.Fatalf("failed to write name field: %v", err)
	}
	if err := writer.WriteField("model", "both"); err != nil {
		t.Fatalf("failed to write model field: %v", err)
	}
	writer.Close()

	handler := web.NewHandler(web.Config{
		Port:     8080,
		StaticFS: fstest.MapFS{"index.html": &fstest.MapFile{Data: []byte("<h1>Test</h1>")}},
	})

	req := httptest.NewRequest(http.MethodPost, "/api/convert", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d: %s", rec.Code, rec.Body.String())
	}

	disposition := rec.Header().Get("Content-Disposition")
	expectedDisp := `attachment; filename="cool_skin.mcpack"`
	if disposition != expectedDisp {
		t.Errorf("expected Content-Disposition %q, got %q", expectedDisp, disposition)
	}

	mcpackBytes := rec.Body.Bytes()
	zr, err := zip.NewReader(bytes.NewReader(mcpackBytes), int64(len(mcpackBytes)))
	if err != nil {
		t.Fatalf("failed to read returned zip archive: %v", err)
	}

	foundManifest := false
	for _, f := range zr.File {
		if f.Name == "manifest.json" {
			foundManifest = true
			break
		}
	}
	if !foundManifest {
		t.Error("manifest.json missing from returned mcpack")
	}
}

func TestHandleConvert_InvalidFile(t *testing.T) {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	part, err := writer.CreateFormFile("skin", "corrupt.png")
	if err != nil {
		t.Fatalf("failed to create form file: %v", err)
	}
	part.Write([]byte("not a png file"))
	writer.Close()

	handler := web.NewHandler(web.Config{
		Port:     8080,
		StaticFS: fstest.MapFS{"index.html": &fstest.MapFile{Data: []byte("<h1>Test</h1>")}},
	})

	req := httptest.NewRequest(http.MethodPost, "/api/convert", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400 for invalid file, got %d", rec.Code)
	}

	var errResp map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &errResp); err != nil {
		t.Fatalf("expected JSON error response, got %v", err)
	}
	if errResp["error"] == "" {
		t.Error("expected non-empty error message in response")
	}
}

func TestHandleConvert_MissingFile(t *testing.T) {
	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	writer.Close()

	handler := web.NewHandler(web.Config{
		Port:     8080,
		StaticFS: fstest.MapFS{"index.html": &fstest.MapFile{Data: []byte("<h1>Test</h1>")}},
	})

	req := httptest.NewRequest(http.MethodPost, "/api/convert", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusBadRequest {
		t.Fatalf("expected status 400 for missing file, got %d", rec.Code)
	}
}

func TestHandleConvert_Success_64x32(t *testing.T) {
	pngData := createTestPNG(t, 64, 32)

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)

	part, err := writer.CreateFormFile("skin", "retro_steve.png")
	if err != nil {
		t.Fatalf("failed to create form file: %v", err)
	}
	if _, err := part.Write(pngData); err != nil {
		t.Fatalf("failed to write png data: %v", err)
	}

	if err := writer.WriteField("name", "retro_steve"); err != nil {
		t.Fatalf("failed to write name field: %v", err)
	}
	if err := writer.WriteField("model", "classic"); err != nil {
		t.Fatalf("failed to write model field: %v", err)
	}
	writer.Close()

	handler := web.NewHandler(web.Config{
		Port:     8080,
		StaticFS: fstest.MapFS{"index.html": &fstest.MapFile{Data: []byte("<h1>Test</h1>")}},
	})

	req := httptest.NewRequest(http.MethodPost, "/api/convert", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d. Body: %s", rec.Code, rec.Body.String())
	}

	if rec.Header().Get("Content-Type") != "application/octet-stream" {
		t.Errorf("expected Content-Type application/octet-stream, got %s", rec.Header().Get("Content-Type"))
	}

	zr, err := zip.NewReader(bytes.NewReader(rec.Body.Bytes()), int64(rec.Body.Len()))
	if err != nil {
		t.Fatalf("response is not a valid zip: %v", err)
	}
	if len(zr.File) < 4 {
		t.Fatalf("expected at least 4 files in mcpack zip, got %d", len(zr.File))
	}
}

func TestServeStatic(t *testing.T) {
	staticFS, err := web.GetStaticFS()
	if err != nil {
		t.Fatalf("failed to get static FS: %v", err)
	}

	handler := web.NewHandler(web.Config{
		Port:     8080,
		StaticFS: staticFS,
	})

	testPaths := []string{
		"/",
		"/style.css",
		"/qrcode.js",
		"/app.js",
		"/static/style.css",
		"/static/qrcode.js",
		"/static/app.js",
		"/three.min.js",
		"/static/three.min.js",
	}

	for _, p := range testPaths {
		req := httptest.NewRequest(http.MethodGet, p, nil)
		rec := httptest.NewRecorder()
		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusOK {
			t.Errorf("expected 200 for %s, got %d", p, rec.Code)
		}
		if rec.Body.Len() == 0 {
			t.Errorf("empty body for %s", p)
		}
	}
}

func TestEditorStaticAssets_HTMLStructure(t *testing.T) {
	staticFS, err := web.GetStaticFS()
	if err != nil {
		t.Fatalf("failed to get static FS: %v", err)
	}

	indexBytes, err := fs.ReadFile(staticFS, "index.html")
	if err != nil {
		t.Fatalf("failed to read index.html: %v", err)
	}
	html := string(indexBytes)

	// 1. Mannequin widget elements
	expectedElements := []string{
		"id=\"mannequinWidget\"",
		"data-mannequin-part=\"head\"",
		"data-mannequin-part=\"torso\"",
		"data-mannequin-part=\"rightArm\"",
		"data-mannequin-part=\"leftArm\"",
		"data-mannequin-part=\"rightLeg\"",
		"data-mannequin-part=\"leftLeg\"",
	}
	for _, elem := range expectedElements {
		if !strings.Contains(html, elem) {
			t.Errorf("index.html missing mannequin element: %s", elem)
		}
	}

	// 2. Floating vertical zoom controls with Zoom In, Reset, Zoom Out
	zoomControls := []string{
		"class=\"zoom-vertical-controls\"",
		"id=\"btnZoom3DIn\"",
		"id=\"btnZoom3DReset\"",
		"id=\"btnZoom3DOut\"",
		"⟲",
	}
	for _, ctrl := range zoomControls {
		if !strings.Contains(html, ctrl) {
			t.Errorf("index.html missing vertical zoom control: %s", ctrl)
		}
	}

	// 3. Deprecated horizontal slider MUST NOT be rendered
	if strings.Contains(html, "id=\"zoom3DSlider\"") {
		t.Errorf("index.html must not contain deprecated horizontal slider id=\"zoom3DSlider\"")
	}

	// 4. Skin naming modal elements
	namingModalElements := []string{
		"id=\"skinNameModal\"",
		"id=\"skinNameInput\"",
		"id=\"btnConfirmSkinName\"",
		"id=\"btnCancelSkinName\"",
	}
	for _, elem := range namingModalElements {
		if !strings.Contains(html, elem) {
			t.Errorf("index.html missing skin naming modal element: %s", elem)
		}
	}
}

func TestEditorStaticAssets_JavaScriptLogic(t *testing.T) {
	staticFS, err := web.GetStaticFS()
	if err != nil {
		t.Fatalf("failed to get static FS: %v", err)
	}

	threeBytes, err := fs.ReadFile(staticFS, "three.min.js")
	if err != nil {
		t.Fatalf("failed to read three.min.js: %v", err)
	}
	threeJS := string(threeBytes)

	// 1. three.min.js camera target focusing, reset, axis-based raycasting, reticle highlight
	expectedThreeFeatures := []string{
		"focusPart",
		"resetCamera",
		"this.target",
		"tNearX",
		"tNearY",
		"tNearZ",
		"hoverPixel",
	}
	for _, feat := range expectedThreeFeatures {
		if !strings.Contains(threeJS, feat) {
			t.Errorf("three.min.js missing expected feature: %s", feat)
		}
	}

	appBytes, err := fs.ReadFile(staticFS, "app.js")
	if err != nil {
		t.Fatalf("failed to read app.js: %v", err)
	}
	appJS := string(appBytes)

	// 2. app.js complete UV template coverage (neck bottom, shoulder tops, palm bottoms, shoe sides, shoe soles)
	expectedTemplateCoverage := []string{
		"16, 0, 8, 8",     // Neck bottom
		"44, 16, armW, 4", // Right shoulder top
		"4, 16, 4, 4",     // Right leg top
		"8, 16, 4, 4",     // Right leg bottom / sole
		"0, 30, 4, 2",     // Right leg shoe side
		"8, 30, 4, 2",     // Right leg shoe side
	}
	for _, cov := range expectedTemplateCoverage {
		if !strings.Contains(appJS, cov) {
			t.Errorf("app.js missing template UV coverage: %s", cov)
		}
	}

	// 3. app.js photography-style grid & coordinate normalization with getBoundingClientRect
	expectedGridLogic := []string{
		"rgba(255, 255, 255, 0.12)", // subtle photography grid
		"rect.width",
		"rect.height",
	}
	for _, grid := range expectedGridLogic {
		if !strings.Contains(appJS, grid) {
			t.Errorf("app.js missing grid logic: %s", grid)
		}
	}

	// 4. app.js skin naming modal logic & upload filename retention
	expectedNamingLogic := []string{
		"skinNameModal",
		"skinNameInput",
		"btnConfirmSkinName",
		"skin_",
	}
	for _, n := range expectedNamingLogic {
		if !strings.Contains(appJS, n) {
			t.Errorf("app.js missing naming modal logic: %s", n)
		}
	}
}


