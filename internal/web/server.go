package web

import (
	"encoding/json"
	"fmt"
	"io"
	"io/fs"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"mcskin/internal/bedrock"
	"mcskin/internal/converter"
)

// Config holds configuration parameters for the web server.
type Config struct {
	Port            int
	AddrsProvider   AddrsProviderFunc
	StaticFS        fs.FS
	ShutdownTrigger func() error
	ShutdownDelay   time.Duration
}

// NewHandler constructs an http.Handler with all application routes.
func NewHandler(cfg Config) http.Handler {
	mux := http.NewServeMux()

	// API Endpoints
	mux.HandleFunc("/api/info", handleInfo(cfg))
	mux.HandleFunc("/api/convert", handleConvert)
	mux.HandleFunc("/api/shutdown", handleShutdown(cfg))

	// Static Assets & Web UI
	if cfg.StaticFS != nil {
		fileServer := http.FileServer(http.FS(cfg.StaticFS))
		mux.Handle("/static/", http.StripPrefix("/static/", fileServer))
		// Dedicated favicon route: serves with explicit Content-Type image/png
		mux.HandleFunc("/favicon.ico", handleFavicon(cfg.StaticFS))
		mux.Handle("/", fileServer)
	}

	return mux
}

// handleFavicon serves the application favicon with an explicit Content-Type of image/png.
// This overrides the default MIME detection which would return image/vnd.microsoft.icon for .ico files.
func handleFavicon(staticFS fs.FS) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}
		data, err := fs.ReadFile(staticFS, "favicon.ico")
		if err != nil {
			http.NotFound(w, r)
			return
		}
		w.Header().Set("Content-Type", "image/png")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write(data)
	}
}

func handleInfo(cfg Config) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet && r.Method != http.MethodHead {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		info := ResolveServerInfo(cfg.Port, cfg.AddrsProvider)
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(info)
	}
}

func handleConvert(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	// 10 MB limit for uploaded skin images
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		writeJSONError(w, http.StatusBadRequest, "Falha ao processar o formulário de upload")
		return
	}

	file, header, err := r.FormFile("skin")
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "Nenhum arquivo de imagem de skin enviado (campo 'skin' ausente)")
		return
	}
	defer file.Close()

	textureData, err := io.ReadAll(file)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, "Falha ao ler os dados da imagem enviada")
		return
	}

	skinName := strings.TrimSpace(r.FormValue("name"))
	if skinName == "" && header != nil {
		base := filepath.Base(header.Filename)
		ext := filepath.Ext(base)
		skinName = strings.TrimSuffix(base, ext)
	}
	if skinName == "" {
		skinName = "custom_skin"
	}

	// Sanitize skin name for safe headers and zip paths
	skinName = sanitizeSkinName(skinName)

	modelParam := strings.ToLower(strings.TrimSpace(r.FormValue("model")))
	modelMode := bedrock.ModelModeBoth
	switch modelParam {
	case "classic":
		modelMode = bedrock.ModelModeClassic
	case "slim":
		modelMode = bedrock.ModelModeSlim
	default:
		modelMode = bedrock.ModelModeBoth
	}

	mcpackBytes, err := converter.ConvertBytes(skinName, textureData, modelMode)
	if err != nil {
		writeJSONError(w, http.StatusBadRequest, fmt.Sprintf("Erro ao converter skin: %v", err))
		return
	}

	w.Header().Set("Content-Type", "application/octet-stream")
	w.Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=%q", skinName+".mcpack"))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(mcpackBytes)
}

func writeJSONError(w http.ResponseWriter, statusCode int, message string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	_ = json.NewEncoder(w).Encode(map[string]string{
		"error": message,
	})
}

func sanitizeSkinName(name string) string {
	var b strings.Builder
	for _, r := range name {
		if (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || (r >= '0' && r <= '9') || r == '_' || r == '-' {
			b.WriteRune(r)
		} else if r == ' ' {
			b.WriteRune('_')
		}
	}
	res := b.String()
	if res == "" {
		return "custom_skin"
	}
	return res
}
