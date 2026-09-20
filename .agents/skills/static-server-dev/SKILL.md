---
name: static-server-dev
description: Use when needing to preview or locally serve the mcskin web UI static files during development, without running the full Go server.
---

# Static Server Dev

## Overview

Canonical command to serve `internal/web/static/` locally for UI preview during prototype development. Use instead of reinventing the approach each session.

---

## Preferred Method: Go built-in (`go run`)

No external dependencies. Uses only Go standard library.

```bash
# Serve static files on port 8787 (avoids conflict with mcskin default :8080)
go run -C /home/douglas/Workspace/minecraft/png-to-mcpack ./scripts/serve-static.go 8787
```

> [!NOTE]
> If `scripts/serve-static.go` does not exist yet, create it once using the template below (it is a one-time scaffold, not repeated work).

### One-Time Script Creation

```go
// scripts/serve-static.go
//go:build ignore

package main

import (
    "fmt"
    "net/http"
    "os"
)

func main() {
    port := "8080"
    if len(os.Args) > 1 {
        port = os.Args[1]
    }
    dir := "internal/web/static"
    fmt.Printf("Serving %s at http://localhost:%s\n", dir, port)
    http.Handle("/", http.FileServer(http.Dir(dir)))
    if err := http.ListenAndServe(":"+port, nil); err != nil {
        fmt.Fprintln(os.Stderr, err)
        os.Exit(1)
    }
}
```

---

## Fallback Method: Python (if Go script unavailable)

```bash
cd /home/douglas/Workspace/minecraft/png-to-mcpack/internal/web/static
python3 -m http.server 8787
```

---

## Port Convention

| Port | Service |
|---|---|
| `8080` | mcskin full Go server (default) |
| `8787` | static-only dev preview |

Always use **8787** for static preview to avoid conflicts with the running mcskin server.

---

## Check Port Before Starting

```bash
# Verify port is free before serving
ss -tlnp | grep 8787 || echo "Port 8787 is free"
```

---

## Limitations of Static Preview

| Feature | Status |
|---|---|
| CSS, HTML, JS rendering | ✅ Works |
| ES6 module imports (`import/export`) | ✅ Works (served over HTTP) |
| `/api/` endpoints (converter, SSE) | ❌ Requires full Go server |
| QR code generation | ❌ Requires full Go server |

For full feature testing, run `make build && ./bin/mcskin` instead.
