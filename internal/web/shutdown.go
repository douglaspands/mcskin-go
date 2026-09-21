package web

import (
	"encoding/json"
	"net/http"
	"time"
)

// ShutdownResponse represents the JSON response sent when shutdown is triggered.
type ShutdownResponse struct {
	Status  string `json:"status"`
	Message string `json:"message"`
}

// handleShutdown handles POST /api/shutdown for graceful server termination.
func handleShutdown(cfg Config) http.HandlerFunc {
	delay := cfg.ShutdownDelay
	if delay <= 0 {
		delay = 100 * time.Millisecond
	}

	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		if !cfg.EnableShutdown {
			writeJSONError(w, http.StatusForbidden, "O desligamento do servidor está desativado")
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_ = json.NewEncoder(w).Encode(ShutdownResponse{
			Status:  "shutting_down",
			Message: "Servidor encerrando...",
		})

		if cfg.ShutdownTrigger != nil {
			go func() {
				time.Sleep(delay)
				_ = cfg.ShutdownTrigger()
			}()
		}
	}
}
