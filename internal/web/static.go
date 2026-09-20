package web

import (
	"embed"
	"io/fs"
)

//go:embed static/*
var staticEmbedFS embed.FS

// GetStaticFS returns an fs.FS sub-rooted at the static/ directory.
func GetStaticFS() (fs.FS, error) {
	return fs.Sub(staticEmbedFS, "static")
}
