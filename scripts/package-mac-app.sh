#!/usr/bin/env bash
set -euo pipefail

# scripts/package-mac-app.sh
# Packages mcskin darwin/arm64 binary into a standard macOS .app bundle.

BINARY_PATH="${1:-bin/mcskin-darwin-arm64}"
OUTPUT_DIR="${2:-dist}"
APP_BUNDLE="${OUTPUT_DIR}/mcskin.app"
ICON_PATH="assets/mcskin.icns"

if [ ! -f "$BINARY_PATH" ]; then
    echo "Error: binary not found at $BINARY_PATH" >&2
    echo "Please build it first: make build-darwin-arm64" >&2
    exit 1
fi

if [ ! -f "$ICON_PATH" ]; then
    echo "Warning: icon not found at $ICON_PATH, generating icon assets..."
    go run scripts/gen-icons.go
fi

echo "Creating macOS application bundle at ${APP_BUNDLE}..."
rm -rf "$APP_BUNDLE"
mkdir -p "${APP_BUNDLE}/Contents/MacOS"
mkdir -p "${APP_BUNDLE}/Contents/Resources"

# 1. Install executable
cp "$BINARY_PATH" "${APP_BUNDLE}/Contents/MacOS/mcskin"
chmod +x "${APP_BUNDLE}/Contents/MacOS/mcskin"

# 2. Install icon
cp "$ICON_PATH" "${APP_BUNDLE}/Contents/Resources/mcskin.icns"

# 3. Generate Info.plist
cat << 'EOF' > "${APP_BUNDLE}/Contents/Info.plist"
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>CFBundleDevelopmentRegion</key>
    <string>pt-BR</string>
    <key>CFBundleDisplayName</key>
    <string>mcskin</string>
    <key>CFBundleExecutable</key>
    <string>mcskin</string>
    <key>CFBundleIconFile</key>
    <string>mcskin.icns</string>
    <key>CFBundleIdentifier</key>
    <string>com.mcskin.app</string>
    <key>CFBundleInfoDictionaryVersion</key>
    <string>6.0</string>
    <key>CFBundleName</key>
    <string>mcskin</string>
    <key>CFBundlePackageType</key>
    <string>APPL</string>
    <key>CFBundleShortVersionString</key>
    <string>1.0.0</string>
    <key>CFBundleVersion</key>
    <string>1</string>
    <key>LSMinimumSystemVersion</key>
    <string>11.0</string>
    <key>NSHighResolutionCapable</key>
    <true/>
</dict>
</plist>
EOF

echo "✓ Successfully created ${APP_BUNDLE}!"
