package main

import (
	"bytes"
	"encoding/binary"
	"image"
	"image/color"
	"image/png"
	"log"
	"os"
)

func main() {
	if err := os.MkdirAll("assets", 0755); err != nil {
		log.Fatalf("failed to create assets dir: %v", err)
	}

	// 1. Generate 256x256 icon
	img256 := generateMinecraftIcon(256)
	var buf256 bytes.Buffer
	if err := png.Encode(&buf256, img256); err != nil {
		log.Fatalf("failed to encode png: %v", err)
	}
	png256Bytes := buf256.Bytes()

	// Also generate 64x64 for multi-resolution ICO
	img64 := resizeNearest(img256, 64, 64)
	var buf64 bytes.Buffer
	_ = png.Encode(&buf64, img64)
	png64Bytes := buf64.Bytes()

	// Also generate 32x32 for favicon
	img32 := resizeNearest(img256, 32, 32)
	var buf32 bytes.Buffer
	_ = png.Encode(&buf32, img32)
	png32Bytes := buf32.Bytes()

	// Write PNG
	if err := os.WriteFile("assets/mcskin.png", png256Bytes, 0644); err != nil {
		log.Fatalf("failed to write mcskin.png: %v", err)
	}
	_ = os.WriteFile("internal/web/static/icon.png", png256Bytes, 0644)

	// Write ICO
	icoBytes := buildICO([][]byte{png32Bytes, png64Bytes, png256Bytes}, []int{32, 64, 256})
	if err := os.WriteFile("assets/mcskin.ico", icoBytes, 0644); err != nil {
		log.Fatalf("failed to write mcskin.ico: %v", err)
	}
	_ = os.WriteFile("internal/web/static/favicon.ico", icoBytes, 0644)

	// Write ICNS
	icnsBytes := buildICNS(png256Bytes)
	if err := os.WriteFile("assets/mcskin.icns", icnsBytes, 0644); err != nil {
		log.Fatalf("failed to write mcskin.icns: %v", err)
	}

	log.Println("Successfully generated mcskin.png, mcskin.ico, and mcskin.icns!")
}

// generateMinecraftIcon draws a Minecraft-style pickaxe and skin block on a 256x256 canvas.
func generateMinecraftIcon(size int) image.Image {
	img := image.NewRGBA(image.Rect(0, 0, size, size))
	scale := float64(size) / 32.0 // 32x32 virtual pixel grid

	setPixel := func(vx, vy int, c color.RGBA) {
		x0 := int(float64(vx) * scale)
		y0 := int(float64(vy) * scale)
		x1 := int(float64(vx+1) * scale)
		y1 := int(float64(vy+1) * scale)
		for y := y0; y < y1; y++ {
			for x := x0; x < x1; x++ {
				img.Set(x, y, c)
			}
		}
	}

	colGrass := color.RGBA{93, 166, 50, 255}
	colGrassDark := color.RGBA{70, 130, 35, 255}
	colDirt := color.RGBA{134, 96, 67, 255}
	colDirtDark := color.RGBA{95, 65, 45, 255}
	colWood := color.RGBA{141, 85, 36, 255}
	colWoodDark := color.RGBA{100, 60, 25, 255}
	colDiamond := color.RGBA{77, 238, 234, 255}
	colDiamondDark := color.RGBA{45, 170, 195, 255}
	colSkin := color.RGBA{211, 154, 116, 255}
	colHair := color.RGBA{70, 44, 22, 255}
	colEye := color.RGBA{41, 128, 185, 255}
	colWhite := color.RGBA{255, 255, 255, 255}

	// 1. Draw 3D-ish Block (bottom-left area: x: 3 to 18, y: 12 to 28)
	// Front Face (Steve Skin / Dirt Block)
	for y := 16; y <= 28; y++ {
		for x := 4; x <= 16; x++ {
			c := colDirt
			if (x+y)%3 == 0 {
				c = colDirtDark
			}
			setPixel(x, y, c)
		}
	}
	// Steve face on front face
	for y := 18; y <= 25; y++ {
		for x := 6; x <= 14; x++ {
			setPixel(x, y, colSkin)
		}
	}
	// Hair on Steve
	for x := 6; x <= 14; x++ {
		setPixel(x, 18, colHair)
	}
	setPixel(6, 19, colHair)
	setPixel(14, 19, colHair)
	// Eyes
	setPixel(7, 21, colWhite)
	setPixel(8, 21, colEye)
	setPixel(12, 21, colEye)
	setPixel(13, 21, colWhite)
	// Mouth
	setPixel(9, 24, colHair)
	setPixel(10, 24, colHair)
	setPixel(11, 24, colHair)

	// Top grass face of block
	for y := 12; y <= 15; y++ {
		for x := 4; x <= 16; x++ {
			c := colGrass
			if (x+y)%2 == 0 {
				c = colGrassDark
			}
			setPixel(x, y, c)
		}
	}

	// 2. Draw Diamond Pickaxe diagonally (from bottom-left to top-right: x: 10->28, y: 24->4)
	// Handle (wooden stick)
	stickCoords := [][2]int{
		{11, 25}, {12, 24}, {13, 23}, {14, 22}, {15, 21}, {16, 20}, {17, 19}, {18, 18},
		{19, 17}, {20, 16}, {21, 15}, {22, 14}, {23, 13},
	}
	for _, pt := range stickCoords {
		setPixel(pt[0], pt[1], colWood)
		setPixel(pt[0]+1, pt[1], colWoodDark)
	}

	// Diamond Head
	headCoords := [][2]int{
		// Center bracket
		{23, 11}, {24, 11}, {24, 12}, {25, 12},
		// Upper arc
		{22, 9}, {23, 9}, {23, 10},
		{20, 7}, {21, 7}, {21, 8}, {22, 8},
		{18, 6}, {19, 6}, {19, 7},
		{16, 6}, {17, 6},
		// Lower arc
		{25, 13}, {26, 13}, {26, 14},
		{27, 15}, {27, 16}, {28, 16},
		{28, 18}, {28, 19}, {27, 19},
		{28, 20}, {28, 21},
	}
	for _, pt := range headCoords {
		setPixel(pt[0], pt[1], colDiamond)
		setPixel(pt[0]+1, pt[1], colDiamondDark)
	}

	return img
}

func resizeNearest(src image.Image, w, h int) image.Image {
	dst := image.NewRGBA(image.Rect(0, 0, w, h))
	srcBounds := src.Bounds()
	srcW := srcBounds.Dx()
	srcH := srcBounds.Dy()
	for y := 0; y < h; y++ {
		sy := (y * srcH) / h
		for x := 0; x < w; x++ {
			sx := (x * srcW) / w
			dst.Set(x, y, src.At(sx, sy))
		}
	}
	return dst
}

func buildICO(pngImages [][]byte, sizes []int) []byte {
	var buf bytes.Buffer
	numImages := uint16(len(pngImages))

	// ICO Header: 6 bytes
	_ = binary.Write(&buf, binary.LittleEndian, uint16(0)) // Reserved
	_ = binary.Write(&buf, binary.LittleEndian, uint16(1)) // Type 1 = ICO
	_ = binary.Write(&buf, binary.LittleEndian, numImages) // Image count

	offset := uint32(6 + 16*len(pngImages))
	for i, data := range pngImages {
		size := sizes[i]
		w := uint8(size)
		h := uint8(size)
		if size >= 256 {
			w = 0
			h = 0
		}
		_ = binary.Write(&buf, binary.LittleEndian, w)
		_ = binary.Write(&buf, binary.LittleEndian, h)
		_ = binary.Write(&buf, binary.LittleEndian, uint8(0))  // Color count
		_ = binary.Write(&buf, binary.LittleEndian, uint8(0))  // Reserved
		_ = binary.Write(&buf, binary.LittleEndian, uint16(1)) // Planes
		_ = binary.Write(&buf, binary.LittleEndian, uint16(32)) // Bit count
		_ = binary.Write(&buf, binary.LittleEndian, uint32(len(data)))
		_ = binary.Write(&buf, binary.LittleEndian, offset)
		offset += uint32(len(data))
	}

	for _, data := range pngImages {
		buf.Write(data)
	}

	return buf.Bytes()
}

func buildICNS(png256 []byte) []byte {
	var buf bytes.Buffer
	totalLen := uint32(8 + 8 + len(png256))

	// Header: 'icns' + length
	buf.WriteString("icns")
	_ = binary.Write(&buf, binary.BigEndian, totalLen)

	// 'ic08' = 256x256 icon in PNG format
	buf.WriteString("ic08")
	_ = binary.Write(&buf, binary.BigEndian, uint32(8+len(png256)))
	buf.Write(png256)

	return buf.Bytes()
}
