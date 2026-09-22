# web-server Specification

## Purpose
Provides an embedded, zero-dependency HTTP server hosting the child-friendly "CRIE SKINS LEGAIS" web application with local Wi-Fi QR code sharing, browser launching, and in-browser Minecraft skin pack conversion.

## Requirements

### Requirement: Embedded Web Server and Static Asset Delivery
The application SHALL host an embedded HTTP server serving "CRIE SKINS LEGAIS" bundled into the executable with zero external dependencies, structured into modular ES6 JavaScript files where no file exceeds 300 lines.

#### Scenario: Serving the root web page
- **WHEN** an HTTP GET request is received at `/`
- **THEN** the server responds 200 with the self-contained HTML document featuring the "CRIE SKINS LEGAIS" Minecraft-themed UI

#### Scenario: Serving embedded assets
- **WHEN** an HTTP GET request is received for static assets (CSS, JS, SVG icons)
- **THEN** the server serves the embedded content with correct MIME types and cache headers

#### Scenario: Serving modular static assets
- **WHEN** the browser requests static JavaScript from `/static/js/`
- **THEN** the server returns native ES6 modules loaded via `<script type="module">`, with no bundler or runtime dependency

### Requirement: Embedded Favicon and Visual Identity Delivery
The embedded web server SHALL serve the application icon (`assets/mcskin.png`) as the website favicon (`/favicon.ico`) and header identity badge, with zero external dependencies.

#### Scenario: Requesting application favicon
- **WHEN** an HTTP GET request is received at `/favicon.ico` or `/static/img/favicon.png`
- **THEN** the server returns 200 with Content-Type `image/png` (or `image/x-icon`) and the embedded icon's binary content

#### Scenario: Favicon link in HTML document
- **WHEN** the main HTML page renders in any browser
- **THEN** a `<link rel="icon" ...>` element references the embedded icon, showing the branding in browser tabs and bookmarks

### Requirement: Kid-Friendly Minecraft-Themed User Interface
The web interface SHALL present a high-contrast, playful Minecraft-aesthetic layout ("CRIE SKINS LEGAIS") in Portuguese for children 6+, with responsive touch support for tablets/phones, a top navigation menu switching between the Converter and 3D Skin Editor views, a responsive 2-column Converter layout on wide screens, uniform Wi-Fi IP display with 1-click copy, and a desktop sidebar aligned right to match the mobile drawer.

#### Scenario: Touch-friendly skin selection and upload
- **WHEN** a user interacts with the upload drop zone on desktop or taps it on touch with a 64x64, 64x32, or 128x128 PNG
- **THEN** the interface accepts the file, previews the texture immediately (mirroring limbs for 64x32), and enables conversion controls

#### Scenario: Model geometry selection
- **WHEN** the user selects a model type (Ambos, Steve / 4px, or Alex / 3px)
- **THEN** the interface updates selection indicators and passes the chosen mode to the conversion payload

#### Scenario: Switching between Converter and Editor screens
- **WHEN** the user taps a header navigation tab
- **THEN** the interface transitions between Converter and Editor views without reloading, retaining active drawing or upload state

#### Scenario: Responsive multi-column converter layout on wide viewports
- **WHEN** viewing the Converter screen at 900px or wider
- **THEN** the drop zone, preview, model selection, and conversion controls display in a balanced multi-column grid, avoiding excess vertical whitespace

#### Scenario: Uniform Wi-Fi IP display with 1-click copy feedback
- **WHEN** the local network IP shows in the converter info section
- **THEN** the IP badge and copy button align uniformly, and tapping copy places the URL on the clipboard and briefly shows "Copiado!"

#### Scenario: Desktop sidebar right alignment
- **WHEN** the app loads on a desktop viewport
- **THEN** the collapsible navigation sidebar anchors to the right, matching the mobile drawer's directionality

### Requirement: In-Browser Skin Pack Conversion API
The web server SHALL provide `POST /api/convert`, accepting a PNG skin file (64x64, 64x32, or 128x128) and model configuration, validating and converting in memory, and returning the generated `.mcpack` as a downloadable attachment.

#### Scenario: Successful skin conversion download
- **WHEN** a valid 64x64, 64x32, or 128x128 PNG posts to `/api/convert` with a model parameter
- **THEN** the server responds 200 with Content-Type `application/octet-stream` (or `application/zip`), a Content-Disposition filename `<skin-name>.mcpack`, and the valid `.mcpack` payload

#### Scenario: Invalid file upload error
- **WHEN** an uploaded file is not a valid 64x64, 64x32, or 128x128 RGBA PNG
- **THEN** the server returns 400 with a friendly JSON error explaining only valid Minecraft skins can be converted

### Requirement: Local Network Discovery and Wi-Fi QR Code
The web server and interface SHALL identify local IPv4 addresses and display a scannable QR code and network URL so phones/tablets on the same Wi-Fi connect effortlessly, supporting `MCSKIN_ENABLE_QR` to disable the QR feature.

#### Scenario: Network address detection endpoint
- **WHEN** an HTTP GET request is sent to `/api/info`
- **THEN** the server returns JSON with the port, loopback URL, discovered LAN IP URLs (e.g. `http://192.168.1.50:8080`), and an `enableQr` boolean

#### Scenario: Offline QR code rendering
- **WHEN** the page loads on any device and `enableQr` is true
- **THEN** a QR code encoding the local network URL renders using an embedded, offline generator with no third-party network requests

#### Scenario: Disabling QR Code via environment variable
- **WHEN** the server starts with `MCSKIN_ENABLE_QR=false` (or `0`)
- **THEN** `/api/info` returns `"enableQr": false` and the interface hides the Wi-Fi QR preview card and its modal trigger

#### Scenario: Default QR Code activation
- **WHEN** `MCSKIN_ENABLE_QR` is unset or `true` (or `1`)
- **THEN** `/api/info` returns `"enableQr": true` and the interface displays the Wi-Fi QR code normally

### Requirement: Automated Default Browser Launching
The application SHALL provide cross-platform automated browser launching, opening the default browser to the local server URL on startup unless disabled.

#### Scenario: Automatic browser launch on Windows and Linux
- **WHEN** web mode starts with browser opening enabled
- **THEN** the application invokes the platform's default browser opener (e.g. `cmd /c start` on Windows, `xdg-open` on Linux) to open `http://localhost:<port>`

### Requirement: Graceful Server Shutdown Endpoint
The web server SHALL provide `POST /api/shutdown`, terminating the local HTTP server cleanly after confirming the request, unless disabled via `MCSKIN_ENABLE_SHUTDOWN`.

#### Scenario: Requesting shutdown via POST
- **WHEN** `MCSKIN_ENABLE_SHUTDOWN` is enabled and a POST request is received at `/api/shutdown`
- **THEN** the server returns 200 with `{"status":"shutting_down","message":"Servidor encerrando..."}` and initiates a graceful `server.Shutdown` in the background within 300ms

#### Scenario: Rejecting invalid HTTP methods on shutdown endpoint
- **WHEN** a non-POST request (e.g. GET or PUT) is sent to `/api/shutdown`
- **THEN** the server responds 405 Method Not Allowed

#### Scenario: Rejecting shutdown request when disabled
- **WHEN** the server started with `MCSKIN_ENABLE_SHUTDOWN=false` (or `0`) and a POST request hits `/api/shutdown`
- **THEN** the server responds 403 Forbidden with a JSON error indicating shutdown is disabled

### Requirement: In-Browser Server Shutdown UI with Confirmation
The web interface SHALL present a discrete, low-profile shutdown button with an interactive confirmation modal styled in the Minecraft aesthetic to prevent unintended terminations, positioning the Fullscreen toggle directly above it in the drawer footer, and hiding it when disabled by the server.

#### Scenario: Clicking the discrete shutdown button
- **WHEN** the user clicks the discrete shutdown button
- **THEN** a confirmation modal asks "Deseja realmente desligar o servidor do mcskin?" with Cancel/Confirm options

#### Scenario: Confirming server shutdown in the modal
- **WHEN** the user confirms shutdown in the modal
- **THEN** the app POSTs to `/api/shutdown` and transitions the UI to a goodbye screen stating the server has shut down and the tab may be closed

#### Scenario: Canceling server shutdown
- **WHEN** the user cancels the modal or clicks outside it
- **THEN** the modal dismisses without any network request, preserving active conversion or editing state

#### Scenario: Positioning the fullscreen button above the shutdown button
- **WHEN** the user views the drawer/sidebar footer
- **THEN** the "Tela Cheia" (Fullscreen) toggle renders inside `drawer-footer` immediately above the shutdown button, removed from the top header action bar

#### Scenario: Hiding the shutdown button when disabled by server
- **WHEN** `/api/info` reports `"enableShutdown": false`
- **THEN** the shutdown button (`drawerBtnShutdown`) is hidden/removed from the drawer footer, leaving the Fullscreen toggle accessible
