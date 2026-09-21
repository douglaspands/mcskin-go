# Spec Delta: web-server

## MODIFIED Requirements

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
