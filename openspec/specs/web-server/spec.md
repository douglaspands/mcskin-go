# web-server Specification

## Purpose
Provides an embedded, zero-dependency HTTP server hosting the child-friendly "CRIE SKINS LEGAIS" web application with local Wi-Fi QR code sharing, browser launching, and in-browser Minecraft skin pack conversion.

## Requirements

### Requirement: Embedded Web Server and Static Asset Delivery
The application SHALL host an embedded HTTP server serving the child-friendly "CRIE SKINS LEGAIS" web application bundled into the executable binary with zero external dependencies, structured into clean, modular ES6 JavaScript files where no individual file exceeds 300 lines of code.

#### Scenario: Serving the root web page
- **WHEN** an HTTP GET request is received at `/`
- **THEN** the server responds with status 200 and the self-contained HTML document featuring the "CRIE SKINS LEGAIS" Minecraft-themed UI

#### Scenario: Serving embedded assets
- **WHEN** an HTTP GET request is received for static assets (CSS, JS, SVG icons)
- **THEN** the server serves the corresponding embedded content with correct MIME types and cache headers

#### Scenario: Serving modular static assets
- **WHEN** the browser requests static JavaScript assets from `/static/js/`
- **THEN** the server returns native ES6 modules loaded via `<script type="module">` without requiring third-party bundlers or runtime dependencies

### Requirement: Embedded Favicon and Visual Identity Delivery
The embedded web server and static asset delivery system SHALL serve the application icon (`assets/mcskin.png`) as the website favicon (`/favicon.ico`) and header identity badge with zero external dependencies.

#### Scenario: Requesting application favicon
- **WHEN** an HTTP GET request is received at `/favicon.ico` or `/static/img/favicon.png`
- **THEN** the server returns status 200 with Content-Type `image/png` (or `image/x-icon`) and the binary content of the embedded icon

#### Scenario: Favicon link in HTML document
- **WHEN** the main HTML page is rendered in any browser
- **THEN** a `<link rel="icon" ...>` element references the embedded application icon, displaying the Minecraft skin pack branding in browser tabs and bookmarks

### Requirement: Kid-Friendly Minecraft-Themed User Interface
The web interface SHALL present a high-contrast, playful Minecraft-aesthetic layout ("CRIE SKINS LEGAIS") in Portuguese, optimized for children aged 6 and older, with responsive touch support for tablets and mobile phones, featuring a top navigation menu to switch between the Converter view and the 3D Skin Editor view, a responsive 2-column layout for the Converter tab on wide screens, uniform Wi-Fi IP display with 1-click copy action, and desktop sidebar aligned to the right side to match mobile drawer ergonomics.

#### Scenario: Touch-friendly skin selection and upload
- **WHEN** a user interacts with the upload drop zone on desktop or taps it on a touch device with a 64x64, 64x32, or 128x128 PNG file
- **THEN** the interface accepts the PNG file, displays an immediate preview of the skin texture (mirroring limbs for 64x32 skins), and enables conversion controls

#### Scenario: Model geometry selection
- **WHEN** the user selects a model type (Ambos, Steve / 4px, or Alex / 3px)
- **THEN** the interface updates visual selection indicators and passes the chosen model mode to the conversion payload

#### Scenario: Switching between Converter and Editor screens
- **WHEN** the user taps or clicks on navigation tabs in the header
- **THEN** the interface transitions smoothly between the Converter view and the Editor view without reloading the page, retaining any active drawing or upload state

#### Scenario: Responsive multi-column converter layout on wide viewports
- **WHEN** viewing the Converter screen on viewports 900px or wider
- **THEN** the drop zone, skin preview, model selection, and conversion controls display in a balanced multi-column grid, avoiding excessive vertical whitespace

#### Scenario: Uniform Wi-Fi IP display with 1-click copy feedback
- **WHEN** the local network IP is shown in the converter info section
- **THEN** the IP badge and copy button are uniformly aligned, and tapping the copy button copies the URL to the clipboard and briefly displays confirmation text ("Copiado!")

#### Scenario: Desktop sidebar right alignment
- **WHEN** the web application is loaded on a desktop viewport
- **THEN** the collapsible navigation sidebar is anchored to the right side of the screen, matching mobile navigation drawer directionality

### Requirement: In-Browser Skin Pack Conversion API
The web server SHALL provide an HTTP POST endpoint (`/api/convert`) that accepts a PNG skin file (64x64, 64x32, or 128x128) and model configuration, performs validation and conversion in memory, and returns the generated `.mcpack` file as a downloadable attachment.

#### Scenario: Successful skin conversion download
- **WHEN** a valid 64x64, 64x32, or 128x128 PNG is posted to `/api/convert` with a model parameter
- **THEN** the server responds with HTTP 200, Content-Type `application/octet-stream` (or `application/zip`), Content-Disposition header with filename `<skin-name>.mcpack`, and the valid `.mcpack` payload

#### Scenario: Invalid file upload error
- **WHEN** an uploaded file is not a valid 64x64, 64x32, or 128x128 RGBA PNG
- **THEN** the server returns HTTP 400 with a friendly JSON error message explaining that only valid Minecraft skins can be converted

### Requirement: Local Network Discovery and Wi-Fi QR Code
The web server and interface SHALL identify local network IPv4 addresses and display a scannable QR Code and clear network URL, allowing phones and tablets on the same Wi-Fi to connect effortlessly, while supporting environment variable control (`MCSKIN_ENABLE_QR`) to disable QR code features when desired.

#### Scenario: Network address detection endpoint
- **WHEN** an HTTP GET request is sent to `/api/info`
- **THEN** the server returns a JSON response containing the port, local loopback URL, discovered LAN IP URLs (e.g. `http://192.168.1.50:8080`), and an `enableQr` boolean reflecting the server configuration

#### Scenario: Offline QR code rendering
- **WHEN** the web page loads on any device and `enableQr` is true
- **THEN** a QR code encoding the local network access URL is rendered on the screen using an embedded, offline generator without third-party network requests

#### Scenario: Disabling QR Code via environment variable
- **WHEN** the server starts with `MCSKIN_ENABLE_QR=false` (or `0`)
- **THEN** `/api/info` returns `"enableQr": false` and the web interface completely hides the Wi-Fi QR code preview card and modal expansion triggers

#### Scenario: Default QR Code activation
- **WHEN** `MCSKIN_ENABLE_QR` is not set or set to `true` (or `1`)
- **THEN** `/api/info` returns `"enableQr": true` and the web interface displays the Wi-Fi QR code normally

### Requirement: Automated Default Browser Launching
The application SHALL provide cross-platform automated browser launching that opens the default web browser to the local server URL upon startup unless disabled.

#### Scenario: Automatic browser launch on Windows and Linux
- **WHEN** web mode starts with browser opening enabled
- **THEN** the application invokes the platform default browser opener (e.g. `cmd /c start` on Windows, `xdg-open` on Linux) to open `http://localhost:<port>`

### Requirement: Graceful Server Shutdown Endpoint
The web server SHALL provide an HTTP POST endpoint (`/api/shutdown`) that terminates the local HTTP server process cleanly after confirming the shutdown request, unless shutdown is disabled via environment variable (`MCSKIN_ENABLE_SHUTDOWN`).

#### Scenario: Requesting shutdown via POST
- **WHEN** `MCSKIN_ENABLE_SHUTDOWN` is enabled and an HTTP POST request is received at `/api/shutdown`
- **THEN** the server returns status 200 with JSON payload `{"status":"shutting_down","message":"Servidor encerrando..."}` and initiates a graceful shutdown (`server.Shutdown`) in background within 300ms.

#### Scenario: Rejecting invalid HTTP methods on shutdown endpoint
- **WHEN** a non-POST request (e.g. GET or PUT) is sent to `/api/shutdown`
- **THEN** the server responds with HTTP status 405 Method Not Allowed.

#### Scenario: Rejecting shutdown request when disabled
- **WHEN** the server was started with `MCSKIN_ENABLE_SHUTDOWN=false` (or `0`) and a POST request is received at `/api/shutdown`
- **THEN** the server responds with HTTP status 403 Forbidden and a JSON error indicating that server shutdown is disabled

### Requirement: In-Browser Server Shutdown UI with Confirmation
The web interface SHALL present a discrete, low-profile shutdown button with an interactive confirmation modal styled in the Minecraft aesthetic to prevent unintended terminations, while positioning the Fullscreen toggle button directly above the shutdown button in the drawer footer, and hiding the shutdown button when disabled by the server.

#### Scenario: Clicking the discrete shutdown button
- **WHEN** the user clicks or taps the discrete shutdown button in the interface
- **THEN** a confirmation modal is displayed asking for confirmation ("Deseja realmente desligar o servidor do mcskin?") with options to Cancel or Confirm.

#### Scenario: Confirming server shutdown in the modal
- **WHEN** the user confirms the shutdown in the modal
- **THEN** the application sends a POST request to `/api/shutdown`, transitions the UI into a friendly goodbye screen informing the user that the server has shut down and the browser tab may be closed.

#### Scenario: Canceling server shutdown
- **WHEN** the user cancels the modal or clicks outside the dialog
- **THEN** the modal dismisses without sending any network requests, preserving active skin conversion or editing state.

#### Scenario: Positioning the fullscreen button above the shutdown button
- **WHEN** the user views the drawer or navigation sidebar footer
- **THEN** the "Tela Cheia" (Fullscreen) toggle button is rendered prominently inside `drawer-footer`, situated immediately above the shutdown button, while removed from the top header right action bar

#### Scenario: Hiding the shutdown button when disabled by server
- **WHEN** `/api/info` reports `"enableShutdown": false`
- **THEN** the shutdown button (`drawerBtnShutdown`) is hidden or removed from the drawer footer, leaving the Fullscreen toggle accessible

