package bedrock

import (
	"fmt"
)

// Header represents the pack header in manifest.json.
type Header struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	UUID        string `json:"uuid"`
	Version     []int  `json:"version"`
}

// Module represents a pack module in manifest.json.
type Module struct {
	Type    string `json:"type"`
	UUID    string `json:"uuid"`
	Version []int  `json:"version"`
}

// Manifest represents Minecraft Bedrock manifest.json format.
type Manifest struct {
	FormatVersion int      `json:"format_version"`
	Header        Header   `json:"header"`
	Modules       []Module `json:"modules"`
}

// SkinEntry represents an individual skin in skins.json.
type SkinEntry struct {
	LocalizationName string `json:"localization_name"`
	Geometry         string `json:"geometry"`
	Texture          string `json:"texture"`
	Type             string `json:"type"`
}

// SkinsConfig represents Minecraft Bedrock skins.json format.
type SkinsConfig struct {
	Skins         []SkinEntry `json:"skins"`
	SerializeName string      `json:"serialize_name"`
}

// GenerateManifest creates a valid Minecraft Bedrock manifest.json structure.
func GenerateManifest(packName, description, headerUUID, moduleUUID string) (*Manifest, error) {
	return &Manifest{
		FormatVersion: 2,
		Header: Header{
			Name:        packName,
			Description: description,
			UUID:        headerUUID,
			Version:     []int{1, 0, 0},
		},
		Modules: []Module{
			{
				Type:    "skin_pack",
				UUID:    moduleUUID,
				Version: []int{1, 0, 0},
			},
		},
	}, nil
}

// GenerateSkinsJSON creates a valid Minecraft Bedrock skins.json structure.
func GenerateSkinsJSON(skinName, textureFilename string, slim bool) (*SkinsConfig, error) {
	geometry := "geometry.humanoid.custom"
	if slim {
		geometry = "geometry.humanoid.customSlim"
	}

	return &SkinsConfig{
		Skins: []SkinEntry{
			{
				LocalizationName: skinName,
				Geometry:         geometry,
				Texture:          textureFilename,
				Type:             "free",
			},
		},
		SerializeName: skinName,
	}, nil
}

// GenerateLang creates standard Bedrock en_US localization key-value pairs.
func GenerateLang(skinName string) string {
	return fmt.Sprintf("skinpack.%s=%s\nskin.%s.%s=%s\n", skinName, skinName, skinName, skinName, skinName)
}
