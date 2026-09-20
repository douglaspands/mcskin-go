# Spec Delta: web-server

## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Graceful Server Shutdown Endpoint
The web server SHALL provide an HTTP POST endpoint (`/api/shutdown`) that terminates the local HTTP server process cleanly after confirming the shutdown request.

#### Scenario: Requesting shutdown via POST
- **WHEN** an HTTP POST request is received at `/api/shutdown`
- **THEN** the server returns status 200 with JSON payload `{"status":"shutting_down","message":"Servidor encerrando..."}` and initiates a graceful shutdown (`server.Shutdown`) in background within 300ms.

#### Scenario: Rejecting invalid HTTP methods on shutdown endpoint
- **WHEN** a non-POST request (e.g. GET or PUT) is sent to `/api/shutdown`
- **THEN** the server responds with HTTP status 405 Method Not Allowed.

### Requirement: In-Browser Server Shutdown UI with Confirmation
The web interface SHALL present a discrete, low-profile shutdown button with an interactive confirmation modal styled in the Minecraft aesthetic to prevent unintended terminations.

#### Scenario: Clicking the discrete shutdown button
- **WHEN** the user clicks or taps the discrete shutdown button in the interface
- **THEN** a confirmation modal is displayed asking for confirmation ("Deseja realmente desligar o servidor do mcskin?") with options to Cancel or Confirm.

#### Scenario: Confirming server shutdown in the modal
- **WHEN** the user confirms the shutdown in the modal
- **THEN** the application sends a POST request to `/api/shutdown`, transitions the UI into a friendly goodbye screen informing the user that the server has shut down and the browser tab may be closed.

#### Scenario: Canceling server shutdown
- **WHEN** the user cancels the modal or clicks outside the dialog
- **THEN** the modal dismisses without sending any network requests, preserving active skin conversion or editing state.
