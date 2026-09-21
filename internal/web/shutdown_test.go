package web_test

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"mcskin/internal/web"
)

func TestHandleShutdown_PostSuccess(t *testing.T) {
	shutdownCalled := make(chan struct{}, 1)
	cfg := web.Config{
		Port:           8080,
		EnableShutdown: true,
		ShutdownTrigger: func() error {
			shutdownCalled <- struct{}{}
			return nil
		},
	}

	handler := web.NewHandler(cfg)

	req := httptest.NewRequest(http.MethodPost, "/api/shutdown", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("expected status 200, got %d. Body: %s", rec.Code, rec.Body.String())
	}

	contentType := rec.Header().Get("Content-Type")
	if !stringsContains(contentType, "application/json") {
		t.Errorf("expected Content-Type application/json, got %q", contentType)
	}

	var resp struct {
		Status  string `json:"status"`
		Message string `json:"message"`
	}
	if err := json.Unmarshal(rec.Body.Bytes(), &resp); err != nil {
		t.Fatalf("failed to decode JSON response: %v", err)
	}

	if resp.Status != "shutting_down" {
		t.Errorf("expected status 'shutting_down', got %q", resp.Status)
	}
	if resp.Message != "Servidor encerrando..." {
		t.Errorf("expected message 'Servidor encerrando...', got %q", resp.Message)
	}

	select {
	case <-shutdownCalled:
		// shutdown trigger was called successfully
	case <-time.After(500 * time.Millisecond):
		t.Error("timed out waiting for shutdown trigger to be called")
	}
}

func TestHandleShutdown_MethodNotAllowed(t *testing.T) {
	cfg := web.Config{
		Port: 8080,
	}
	handler := web.NewHandler(cfg)

	disallowedMethods := []string{
		http.MethodGet,
		http.MethodPut,
		http.MethodDelete,
		http.MethodPatch,
		http.MethodHead,
	}

	for _, method := range disallowedMethods {
		req := httptest.NewRequest(method, "/api/shutdown", nil)
		rec := httptest.NewRecorder()

		handler.ServeHTTP(rec, req)

		if rec.Code != http.StatusMethodNotAllowed {
			t.Errorf("expected status 405 Method Not Allowed for %s, got %d", method, rec.Code)
		}
	}
}

func TestHandleShutdown_DisabledForbidden(t *testing.T) {
	shutdownCalled := false
	cfg := web.Config{
		Port:           8080,
		EnableShutdown: false,
		ShutdownTrigger: func() error {
			shutdownCalled = true
			return nil
		},
	}

	handler := web.NewHandler(cfg)

	req := httptest.NewRequest(http.MethodPost, "/api/shutdown", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusForbidden {
		t.Fatalf("expected status 403 Forbidden, got %d. Body: %s", rec.Code, rec.Body.String())
	}

	if shutdownCalled {
		t.Error("shutdown trigger was called even though shutdown was disabled")
	}

	var errResp map[string]string
	if err := json.Unmarshal(rec.Body.Bytes(), &errResp); err != nil {
		t.Fatalf("failed to decode JSON error: %v", err)
	}
	if errResp["error"] == "" {
		t.Error("expected non-empty error message in response")
	}
}

func stringsContains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(substr) == 0 || containsSubstr(s, substr))
}

func containsSubstr(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
