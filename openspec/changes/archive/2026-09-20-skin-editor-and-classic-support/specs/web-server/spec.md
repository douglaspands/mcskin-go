# web-server Specification Delta

## MODIFIED Requirements

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
