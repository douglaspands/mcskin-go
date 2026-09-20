# web-server Specification

## Purpose
Provides an embedded, zero-dependency HTTP server hosting the child-friendly "CRIE SKINS LEGAIS" web application with local Wi-Fi QR code sharing, browser launching, and in-browser Minecraft skin pack conversion.

## Requirements

### Requirement: Embedded Web Server and Static Asset Delivery
The application SHALL host an embedded HTTP server serving the "CRIE SKINS LEGAIS" web application bundled into the executable binary with zero external dependencies.

#### Scenario: Serving the root web page
- **WHEN** an HTTP GET request is received at `/`
- **THEN** the server responds with status 200 and the self-contained HTML document featuring the "CRIE SKINS LEGAIS" Minecraft-themed UI

#### Scenario: Serving embedded assets
- **WHEN** an HTTP GET request is received for static assets (CSS, JS, SVG icons)
- **THEN** the server serves the corresponding embedded content with correct MIME types and cache headers

### Requirement: Kid-Friendly Minecraft-Themed User Interface
The web interface SHALL present a high-contrast, playful Minecraft-aesthetic layout ("CRIE SKINS LEGAIS") in Portuguese, optimized for children aged 6 and older, with responsive touch support for tablets and mobile phones, featuring a top navigation menu to switch between the Converter view and the 3D Skin Editor view.

#### Scenario: Touch-friendly skin selection and upload
- **WHEN** a user interacts with the upload drop zone on desktop or taps it on a touch device with a 64x64, 64x32, or 128x128 PNG file
- **THEN** the interface accepts the PNG file, displays an immediate preview of the skin texture (mirroring limbs for 64x32 skins), and enables conversion controls

#### Scenario: Model geometry selection
- **WHEN** the user selects a model type (Ambos, Steve / 4px, or Alex / 3px)
- **THEN** the interface updates visual selection indicators and passes the chosen model mode to the conversion payload

#### Scenario: Switching between Converter and Editor screens
- **WHEN** the user taps or clicks on navigation tabs in the header
- **THEN** the interface transitions smoothly between the Converter view and the Editor view without reloading the page, retaining any active drawing or upload state

### Requirement: In-Browser Skin Pack Conversion API
The web server SHALL provide an HTTP POST endpoint (`/api/convert`) that accepts a PNG skin file (64x64, 64x32, or 128x128) and model configuration, performs validation and conversion in memory, and returns the generated `.mcpack` file as a downloadable attachment.

#### Scenario: Successful skin conversion download
- **WHEN** a valid 64x64, 64x32, or 128x128 PNG is posted to `/api/convert` with a model parameter
- **THEN** the server responds with HTTP 200, Content-Type `application/octet-stream` (or `application/zip`), Content-Disposition header with filename `<skin-name>.mcpack`, and the valid `.mcpack` payload

#### Scenario: Invalid file upload error
- **WHEN** an uploaded file is not a valid 64x64, 64x32, or 128x128 RGBA PNG
- **THEN** the server returns HTTP 400 with a friendly JSON error message explaining that only valid Minecraft skins can be converted

### Requirement: Local Network Discovery and Wi-Fi QR Code
The web server and interface SHALL identify local network IPv4 addresses and display a scannable QR Code and clear network URL, allowing phones and tablets on the same Wi-Fi to connect effortlessly.

#### Scenario: Network address detection endpoint
- **WHEN** an HTTP GET request is sent to `/api/info`
- **THEN** the server returns a JSON response containing the port, local loopback URL, and discovered LAN IP URLs (e.g. `http://192.168.1.50:8080`)

#### Scenario: Offline QR code rendering
- **WHEN** the web page loads on any device
- **THEN** a QR code encoding the local network access URL is rendered on the screen using an embedded, offline generator without third-party network requests

### Requirement: Automated Default Browser Launching
The application SHALL provide cross-platform automated browser launching that opens the default web browser to the local server URL upon startup unless disabled.

#### Scenario: Automatic browser launch on Windows and Linux
- **WHEN** web mode starts with browser opening enabled
- **THEN** the application invokes the platform default browser opener (e.g. `cmd /c start` on Windows, `xdg-open` on Linux) to open `http://localhost:<port>`
