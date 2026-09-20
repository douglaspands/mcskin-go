# Spec Delta: web-server

## ADDED Requirements

### Requirement: Embedded Favicon and Visual Identity Delivery
The embedded web server and static asset delivery system SHALL serve the application icon (`assets/mcskin.png`) as the website favicon (`/favicon.ico`) and header identity badge with zero external dependencies.

#### Scenario: Requesting application favicon
- **WHEN** an HTTP GET request is received at `/favicon.ico` or `/static/img/favicon.png`
- **THEN** the server returns status 200 with Content-Type `image/png` (or `image/x-icon`) and the binary content of the embedded icon

#### Scenario: Favicon link in HTML document
- **WHEN** the main HTML page is rendered in any browser
- **THEN** a `<link rel="icon" ...>` element references the embedded application icon, displaying the Minecraft skin pack branding in browser tabs and bookmarks

## MODIFIED Requirements

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
