#!/usr/bin/env python3
"""
Bedrock Skin Pack Verifier
Inspects and validates Minecraft Bedrock .mcpack archives for format, schema compliance,
UUIDv4 uniqueness, and texture dimensions.
"""

import sys
import os
import json
import zipfile
import re
import struct

UUID_REGEX = re.compile(r'^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', re.IGNORECASE)

def parse_png_dimensions(data: bytes):
    # PNG signature: 89 50 4E 47 0D 0A 1A 0A
    if len(data) < 24 or data[:8] != b'\x89PNG\r\n\x1a\n':
        return None, "Not a valid PNG signature"
    # IHDR chunk immediately follows: length (4 bytes), type "IHDR" (4 bytes), width (4 bytes), height (4 bytes)
    if data[12:16] != b'IHDR':
        return None, "Missing IHDR chunk"
    width, height = struct.unpack('>II', data[16:24])
    return (width, height), None

def verify_mcpack(filepath: str):
    if not os.path.exists(filepath):
        return {"valid": False, "errors": [f"File not found: {filepath}"]}

    errors = []
    metadata = {
        "file": filepath,
        "size_bytes": os.path.getsize(filepath),
    }

    try:
        with zipfile.ZipFile(filepath, 'r') as zf:
            namelist = zf.namelist()
            metadata["entries"] = namelist

            # Check required manifest.json
            if "manifest.json" not in namelist:
                errors.append("Missing required manifest.json")
                manifest = None
            else:
                try:
                    manifest_data = zf.read("manifest.json").decode('utf-8')
                    manifest = json.loads(manifest_data)
                except Exception as e:
                    errors.append(f"Invalid JSON in manifest.json: {str(e)}")
                    manifest = None

            # Check required skins.json
            if "skins.json" not in namelist:
                errors.append("Missing required skins.json")
                skins_cfg = None
            else:
                try:
                    skins_data = zf.read("skins.json").decode('utf-8')
                    skins_cfg = json.loads(skins_data)
                except Exception as e:
                    errors.append(f"Invalid JSON in skins.json: {str(e)}")
                    skins_cfg = None

            # Check required texts/en_US.lang
            if "texts/en_US.lang" not in namelist:
                errors.append("Missing required texts/en_US.lang")
                lang_data = ""
            else:
                try:
                    lang_data = zf.read("texts/en_US.lang").decode('utf-8')
                except Exception as e:
                    errors.append(f"Error reading texts/en_US.lang: {str(e)}")
                    lang_data = ""

            # Check texture PNG
            png_entries = [name for name in namelist if name.lower().endswith(".png")]
            if not png_entries:
                errors.append("No PNG texture found in archive")
            else:
                texture_name = png_entries[0]
                metadata["texture_entry"] = texture_name
                try:
                    png_bytes = zf.read(texture_name)
                    dims, err = parse_png_dimensions(png_bytes)
                    if err:
                        errors.append(f"Invalid texture PNG: {err}")
                    else:
                        metadata["texture_dimensions"] = f"{dims[0]}x{dims[1]}"
                        if dims not in [(64, 64), (128, 128)]:
                            errors.append(f"Unsupported dimensions {dims[0]}x{dims[1]} (must be 64x64 or 128x128)")
                except Exception as e:
                    errors.append(f"Error inspecting texture {texture_name}: {str(e)}")

            # Validate manifest structure
            if manifest:
                fmt_version = manifest.get("format_version")
                if fmt_version != 2:
                    errors.append(f"Invalid format_version {fmt_version} in manifest (expected 2)")

                header = manifest.get("header", {})
                header_uuid = header.get("uuid", "")
                metadata["header_uuid"] = header_uuid
                metadata["pack_name"] = header.get("name", "")

                if not UUID_REGEX.match(header_uuid):
                    errors.append(f"Header UUID {header_uuid} is not a valid RFC-4122 UUIDv4")

                modules = manifest.get("modules", [])
                if not modules or not isinstance(modules, list):
                    errors.append("Manifest missing modules array")
                else:
                    module = modules[0]
                    module_uuid = module.get("uuid", "")
                    metadata["module_uuid"] = module_uuid
                    if not UUID_REGEX.match(module_uuid):
                        errors.append(f"Module UUID {module_uuid} is not a valid RFC-4122 UUIDv4")
                    if header_uuid.lower() == module_uuid.lower() and header_uuid:
                        errors.append("Header UUID and Module UUID must be distinct (found collision)")

            # Validate skins.json structure
            if skins_cfg:
                skins = skins_cfg.get("skins", [])
                if not skins or not isinstance(skins, list):
                    errors.append("skins.json missing skins array")
                else:
                    skin = skins[0]
                    geom = skin.get("geometry", "")
                    metadata["geometry"] = geom
                    if geom not in ["geometry.humanoid.custom", "geometry.humanoid.customSlim"]:
                        errors.append(f"Invalid skin geometry {geom}")
                    metadata["skin_type"] = "slim (3px)" if "Slim" in geom else "classic (4px)"

            # Validate localization
            if lang_data:
                metadata["has_localization"] = True
                if "skinpack." not in lang_data:
                    errors.append("texts/en_US.lang missing skinpack.<name> key")

    except zipfile.BadZipFile:
        return {"valid": False, "errors": [f"File is not a valid ZIP/mcpack archive: {filepath}"]}
    except Exception as e:
        return {"valid": False, "errors": [f"Unexpected inspection error: {str(e)}"]}

    metadata["valid"] = len(errors) == 0
    if errors:
        metadata["errors"] = errors

    return metadata

def main():
    if len(sys.argv) < 2:
        print(json.dumps({"valid": False, "errors": ["Usage: verify-mcpack.py <path/to/pack.mcpack>"]}))
        sys.exit(1)

    filepath = sys.argv[1]
    result = verify_mcpack(filepath)
    print(json.dumps(result, indent=2))
    sys.exit(0 if result.get("valid") else 1)

if __name__ == "__main__":
    main()
