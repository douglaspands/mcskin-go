---
name: bedrock-skin-pack-verifier
description: Validates and inspects Minecraft Bedrock .mcpack skin pack archives for format, schema compliance, UUIDv4 uniqueness, and texture dimensions.
---

# Bedrock Skin Pack Verifier

Use this skill to quickly and token-efficiently verify that a generated `.mcpack` file adheres to all Minecraft Bedrock specifications without dumping massive ZIP listings or raw binary textures into the context window.

---

## Capabilities

The skill automatically validates:
1. **Archive Integrity**: Checks that the file is a readable ZIP archive with valid CRC headers.
2. **Bedrock Manifest (`manifest.json`)**:
   - `format_version == 2`
   - Valid RFC-4122 UUIDv4 for header
   - Valid RFC-4122 UUIDv4 for skin_pack module
   - Header UUID != Module UUID (no duplicate UUID collisions)
3. **Skin Configuration (`skins.json`)**:
   - Valid geometry (`geometry.humanoid.custom` or `geometry.humanoid.customSlim`)
   - Skin texture reference matching PNG in archive root
4. **Localization (`texts/en_US.lang`)**:
   - Valid `skinpack.<name>` keys
5. **Texture Validation**:
   - Valid PNG signature and IHDR chunk
   - Correct skin dimensions (64x64 or 128x128 pixels)

---

## Quick Usage

Run the verification script passing the target `.mcpack` path:

```bash
python3 .agents/skills/bedrock-skin-pack-verifier/scripts/verify-mcpack.py path/to/skin.mcpack
```

### Expected Output Format

Upon success:
```json
{
  "file": "path/to/skin.mcpack",
  "size_bytes": 2512,
  "entries": [
    "manifest.json",
    "skins.json",
    "texts/en_US.lang",
    "skin.png"
  ],
  "texture_entry": "skin.png",
  "texture_dimensions": "64x64",
  "header_uuid": "409c6632-7dcb-47cf-a616-147e50dfb146",
  "pack_name": "skin",
  "module_uuid": "5b4ddced-5490-46d3-ba6b-e47b1305f89f",
  "geometry": "geometry.humanoid.custom",
  "skin_type": "classic (4px)",
  "has_localization": true,
  "valid": true
}
```

Upon failure:
```json
{
  "file": "path/to/corrupt.mcpack",
  "valid": false,
  "errors": [
    "Missing required manifest.json",
    "Unsupported dimensions 100x100 (must be 64x64 or 128x128)"
  ]
}
```
