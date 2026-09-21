//go:build ignore

package main

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"log"
	"os"
	"unicode/utf16"
)

// Resource types in PE format
const (
	rtIcon      = 3
	rtGroupIcon = 14
	rtVersion   = 16
	rtManifest  = 24
)

func main() {
	manifestBytes, err := os.ReadFile("cmd/mcskin/manifest.xml")
	if err != nil {
		log.Fatalf("failed to read manifest.xml: %v", err)
	}

	icoBytes, err := os.ReadFile("assets/mcskin.ico")
	if err != nil {
		log.Fatalf("failed to read assets/mcskin.ico: %v", err)
	}

	versionBytes := buildVersionInfo(
		"mcskin",
		"Minecraft Bedrock Skin Pack Converter",
		"1.3.0.0",
		"1.3.0",
		"mcskin.exe",
		"mcskin developers",
		"Copyright (C) 2026",
	)

	sysoBytes, err := generateSyso(manifestBytes, versionBytes, icoBytes)
	if err != nil {
		log.Fatalf("failed to generate syso: %v", err)
	}

	targetPath := "cmd/mcskin/mcskin_windows_amd64.syso"
	if err := os.WriteFile(targetPath, sysoBytes, 0644); err != nil {
		log.Fatalf("failed to write %s: %v", targetPath, err)
	}

	fmt.Printf("Successfully generated %s (%d bytes)!\n", targetPath, len(sysoBytes))
}

func encodeUTF16(s string) []byte {
	runes := utf16.Encode([]rune(s + "\x00"))
	buf := make([]byte, len(runes)*2)
	for i, r := range runes {
		binary.LittleEndian.PutUint16(buf[i*2:], r)
	}
	return buf
}

func pad4(b *bytes.Buffer) {
	for b.Len()%4 != 0 {
		b.WriteByte(0)
	}
}

func buildVersionInfo(prodName, fileDesc, fileVer, prodVer, origFilename, company, copyright string) []byte {
	var stringTableEntries bytes.Buffer
	addString := func(key, val string) {
		pad4(&stringTableEntries)
		start := stringTableEntries.Len()
		stringTableEntries.Write([]byte{0, 0, 0, 0, 1, 0}) // length(2), valLength(2), type(2)
		stringTableEntries.Write(encodeUTF16(key))
		pad4(&stringTableEntries)
		valStart := stringTableEntries.Len()
		valBytes := encodeUTF16(val)
		stringTableEntries.Write(valBytes)
		entryLen := stringTableEntries.Len() - start
		valLenWords := len(valBytes) / 2
		b := stringTableEntries.Bytes()
		binary.LittleEndian.PutUint16(b[start:], uint16(entryLen))
		binary.LittleEndian.PutUint16(b[start+2:], uint16(valLenWords))
		_ = valStart
	}

	addString("CompanyName", company)
	addString("FileDescription", fileDesc)
	addString("FileVersion", fileVer)
	addString("InternalName", prodName)
	addString("LegalCopyright", copyright)
	addString("OriginalFilename", origFilename)
	addString("ProductName", prodName)
	addString("ProductVersion", prodVer)

	// StringTable: "040904b0" (US English, Unicode)
	var strTable bytes.Buffer
	strTable.Write([]byte{0, 0, 0, 0, 1, 0}) // length(2), valLength(2), type(2)
	strTable.Write(encodeUTF16("040904b0"))
	pad4(&strTable)
	strTable.Write(stringTableEntries.Bytes())
	binary.LittleEndian.PutUint16(strTable.Bytes()[0:], uint16(strTable.Len()))

	// StringFileInfo
	var strFileInfo bytes.Buffer
	strFileInfo.Write([]byte{0, 0, 0, 0, 1, 0})
	strFileInfo.Write(encodeUTF16("StringFileInfo"))
	pad4(&strFileInfo)
	strFileInfo.Write(strTable.Bytes())
	binary.LittleEndian.PutUint16(strFileInfo.Bytes()[0:], uint16(strFileInfo.Len()))

	// VarFileInfo
	var varFileInfo bytes.Buffer
	varFileInfo.Write([]byte{0, 0, 0, 0, 1, 0})
	varFileInfo.Write(encodeUTF16("VarFileInfo"))
	pad4(&varFileInfo)
	varVarStart := varFileInfo.Len()
	varFileInfo.Write([]byte{0, 0, 4, 0, 0, 0}) // len, valLen(4 bytes), type(0=binary)
	varFileInfo.Write(encodeUTF16("Translation"))
	pad4(&varFileInfo)
	_ = binary.Write(&varFileInfo, binary.LittleEndian, uint16(0x0409)) // lang
	_ = binary.Write(&varFileInfo, binary.LittleEndian, uint16(0x04b0)) // charset
	binary.LittleEndian.PutUint16(varFileInfo.Bytes()[varVarStart:], uint16(varFileInfo.Len()-varVarStart))
	binary.LittleEndian.PutUint16(varFileInfo.Bytes()[0:], uint16(varFileInfo.Len()))

	// VS_FIXEDFILEINFO (52 bytes)
	var fixed bytes.Buffer
	_ = binary.Write(&fixed, binary.LittleEndian, uint32(0xFEEF04BD)) // dwSignature
	_ = binary.Write(&fixed, binary.LittleEndian, uint32(0x00010000)) // dwStrucVersion
	_ = binary.Write(&fixed, binary.LittleEndian, uint32(0x00010003)) // dwFileVersionMS
	_ = binary.Write(&fixed, binary.LittleEndian, uint32(0x00000000)) // dwFileVersionLS
	_ = binary.Write(&fixed, binary.LittleEndian, uint32(0x00010003)) // dwProductVersionMS
	_ = binary.Write(&fixed, binary.LittleEndian, uint32(0x00000000)) // dwProductVersionLS
	_ = binary.Write(&fixed, binary.LittleEndian, uint32(0x3F))       // dwFileFlagsMask
	_ = binary.Write(&fixed, binary.LittleEndian, uint32(0))          // dwFileFlags
	_ = binary.Write(&fixed, binary.LittleEndian, uint32(0x00040004)) // dwFileOS (VOS_NT_WINDOWS32)
	_ = binary.Write(&fixed, binary.LittleEndian, uint32(1))          // dwFileType (VFT_APP)
	_ = binary.Write(&fixed, binary.LittleEndian, uint32(0))          // dwFileSubtype
	_ = binary.Write(&fixed, binary.LittleEndian, uint32(0))          // dwFileDateMS
	_ = binary.Write(&fixed, binary.LittleEndian, uint32(0))          // dwFileDateLS

	// Root VS_VERSIONINFO
	var root bytes.Buffer
	root.Write([]byte{0, 0, 52, 0, 0, 0}) // length(2), valLength(2=52), type(2=0)
	root.Write(encodeUTF16("VS_VERSION_INFO"))
	pad4(&root)
	root.Write(fixed.Bytes())
	pad4(&root)
	root.Write(strFileInfo.Bytes())
	pad4(&root)
	root.Write(varFileInfo.Bytes())
	binary.LittleEndian.PutUint16(root.Bytes()[0:], uint16(root.Len()))

	return root.Bytes()
}

type resourceItem struct {
	typeID uint32
	nameID uint32
	langID uint32
	data   []byte
}

func parseICO(icoBytes []byte) ([]resourceItem, error) {
	if len(icoBytes) < 6 {
		return nil, fmt.Errorf("ico file too small")
	}
	count := binary.LittleEndian.Uint16(icoBytes[4:6])
	if len(icoBytes) < 6+int(count)*16 {
		return nil, fmt.Errorf("ico file truncated")
	}

	var items []resourceItem
	var grpIcon bytes.Buffer
	// GRPICONDIR: Reserved(2), Type(2), Count(2)
	grpIcon.Write(icoBytes[0:6])

	for i := 0; i < int(count); i++ {
		entryOffset := 6 + i*16
		entry := icoBytes[entryOffset : entryOffset+16]
		bytesInRes := binary.LittleEndian.Uint32(entry[8:12])
		imgOffset := binary.LittleEndian.Uint32(entry[12:16])
		if int(imgOffset+bytesInRes) > len(icoBytes) {
			return nil, fmt.Errorf("ico image %d out of bounds", i)
		}

		iconID := uint32(i + 1)
		// GRPICONDIRENTRY (14 bytes): width..bitcount (12 bytes) + nID (2 bytes)
		grpIcon.Write(entry[0:12])
		_ = binary.Write(&grpIcon, binary.LittleEndian, uint16(iconID))

		// Raw icon data
		iconData := make([]byte, bytesInRes)
		copy(iconData, icoBytes[imgOffset:imgOffset+bytesInRes])

		items = append(items, resourceItem{
			typeID: rtIcon,
			nameID: iconID,
			langID: 0,
			data:   iconData,
		})
	}

	// Group Icon entry (ID 1)
	items = append(items, resourceItem{
		typeID: rtGroupIcon,
		nameID: 1,
		langID: 0,
		data:   grpIcon.Bytes(),
	})

	return items, nil
}

func generateSyso(manifestBytes, versionBytes, icoBytes []byte) ([]byte, error) {
	var items []resourceItem

	if len(manifestBytes) > 0 {
		items = append(items, resourceItem{
			typeID: rtManifest,
			nameID: 1,
			langID: 0,
			data:   manifestBytes,
		})
	}

	if len(versionBytes) > 0 {
		items = append(items, resourceItem{
			typeID: rtVersion,
			nameID: 1,
			langID: 0x0409,
			data:   versionBytes,
		})
	}

	if len(icoBytes) > 0 {
		icoItems, err := parseICO(icoBytes)
		if err != nil {
			return nil, err
		}
		items = append(items, icoItems...)
	}

	// Sort items by typeID, then nameID, then langID
	// Types should be in order: rtIcon (3), rtGroupIcon (14), rtVersion (16), rtManifest (24)
	for i := 0; i < len(items)-1; i++ {
		for j := i + 1; j < len(items); j++ {
			if items[i].typeID > items[j].typeID ||
				(items[i].typeID == items[j].typeID && items[i].nameID > items[j].nameID) {
				items[i], items[j] = items[j], items[i]
			}
		}
	}

	// Group items by typeID
	type nameGroup struct {
		nameID uint32
		langs  []resourceItem
	}
	type typeGroup struct {
		typeID uint32
		names  []nameGroup
	}

	var types []typeGroup
	for _, it := range items {
		var tg *typeGroup
		for idx := range types {
			if types[idx].typeID == it.typeID {
				tg = &types[idx]
				break
			}
		}
		if tg == nil {
			types = append(types, typeGroup{typeID: it.typeID})
			tg = &types[len(types)-1]
		}

		var ng *nameGroup
		for idx := range tg.names {
			if tg.names[idx].nameID == it.nameID {
				ng = &tg.names[idx]
				break
			}
		}
		if ng == nil {
			tg.names = append(tg.names, nameGroup{nameID: it.nameID})
			ng = &tg.names[len(tg.names)-1]
		}
		ng.langs = append(ng.langs, it)
	}

	// Calculate layout of directory tree
	// Root dir: 16 bytes + len(types)*8
	// Type dirs: for each type: 16 bytes + len(names)*8
	// Name dirs: for each name: 16 bytes + len(langs)*8
	// Data entries: for each item: 16 bytes
	// Raw data: padded to 4-byte boundaries

	totalDirSize := 16 + len(types)*8
	for _, tg := range types {
		totalDirSize += 16 + len(tg.names)*8
		for _, ng := range tg.names {
			totalDirSize += 16 + len(ng.langs)*8
		}
	}
	dataEntriesStart := totalDirSize
	totalDataEntriesSize := len(items) * 16
	rawDataStart := dataEntriesStart + totalDataEntriesSize

	var rsrcBuf bytes.Buffer
	var relocOffsets []uint32

	// 1. Root directory
	_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint32(0)) // Characteristics
	_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint32(0)) // TimeDateStamp
	_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint16(0)) // MajorVersion
	_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint16(0)) // MinorVersion
	_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint16(0)) // NumberOfNamedEntries
	_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint16(len(types))) // NumberOfIdEntries

	typeDirOffset := 16 + len(types)*8
	for _, tg := range types {
		_ = binary.Write(&rsrcBuf, binary.LittleEndian, tg.typeID)
		_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint32(typeDirOffset)|0x80000000)
		typeDirOffset += 16 + len(tg.names)*8
	}

	// 2. Type directories
	nameDirOffset := typeDirOffset
	for _, tg := range types {
		_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint32(0))
		_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint32(0))
		_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint16(0))
		_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint16(0))
		_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint16(0))
		_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint16(len(tg.names)))

		for _, ng := range tg.names {
			_ = binary.Write(&rsrcBuf, binary.LittleEndian, ng.nameID)
			_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint32(nameDirOffset)|0x80000000)
			nameDirOffset += 16 + len(ng.langs)*8
		}
	}

	// 3. Name directories (pointing to DATA ENTRIES)
	dataEntryOffset := dataEntriesStart
	for _, tg := range types {
		for _, ng := range tg.names {
			_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint32(0))
			_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint32(0))
			_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint16(0))
			_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint16(0))
			_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint16(0))
			_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint16(len(ng.langs)))

			for _, it := range ng.langs {
				_ = binary.Write(&rsrcBuf, binary.LittleEndian, it.langID)
				_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint32(dataEntryOffset))
				dataEntryOffset += 16
			}
		}
	}

	// 4. Data entries & Raw data buffer
	var rawDataBuf bytes.Buffer
	currentRawOffset := uint32(rawDataStart)

	for _, tg := range types {
		for _, ng := range tg.names {
			for _, it := range ng.langs {
				entryOffset := uint32(rsrcBuf.Len())
				relocOffsets = append(relocOffsets, entryOffset)

				_ = binary.Write(&rsrcBuf, binary.LittleEndian, currentRawOffset) // RVA placeholder
				_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint32(len(it.data)))
				_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint32(0)) // CodePage
				_ = binary.Write(&rsrcBuf, binary.LittleEndian, uint32(0)) // Reserved

				rawDataBuf.Write(it.data)
				for rawDataBuf.Len()%4 != 0 {
					rawDataBuf.WriteByte(0)
				}
				currentRawOffset = uint32(rawDataStart + rawDataBuf.Len())
			}
		}
	}

	rsrcBuf.Write(rawDataBuf.Bytes())
	// Pad rsrc section to 4 bytes
	for rsrcBuf.Len()%4 != 0 {
		rsrcBuf.WriteByte(0)
	}

	rsrcData := rsrcBuf.Bytes()

	// 5. Construct COFF Object File (.syso) for AMD64
	// Header: 20 bytes
	// 1 Section Header: 40 bytes
	// Raw Data: len(rsrcData)
	// Relocations: len(relocOffsets) * 10 bytes
	// Symbol Table: 1 symbol = 18 bytes
	// String Table: 4 bytes (len = 4)

	pointerToRawData := uint32(20 + 40)
	pointerToRelocs := pointerToRawData + uint32(len(rsrcData))
	pointerToSymbols := pointerToRelocs + uint32(len(relocOffsets)*10)

	var syso bytes.Buffer

	// COFF File Header
	_ = binary.Write(&syso, binary.LittleEndian, uint16(0x8664)) // IMAGE_FILE_MACHINE_AMD64
	_ = binary.Write(&syso, binary.LittleEndian, uint16(1))      // NumberOfSections = 1
	_ = binary.Write(&syso, binary.LittleEndian, uint32(0))      // TimeDateStamp
	_ = binary.Write(&syso, binary.LittleEndian, pointerToSymbols)
	_ = binary.Write(&syso, binary.LittleEndian, uint32(1))      // NumberOfSymbols = 1
	_ = binary.Write(&syso, binary.LittleEndian, uint16(0))      // SizeOfOptionalHeader = 0
	_ = binary.Write(&syso, binary.LittleEndian, uint16(0x0104)) // Characteristics: LINE_NUMS_STRIPPED | 32BIT_MACHINE

	// Section Header: .rsrc
	var sectName [8]byte
	copy(sectName[:], ".rsrc")
	syso.Write(sectName[:])
	_ = binary.Write(&syso, binary.LittleEndian, uint32(0))                // VirtualSize
	_ = binary.Write(&syso, binary.LittleEndian, uint32(0))                // VirtualAddress
	_ = binary.Write(&syso, binary.LittleEndian, uint32(len(rsrcData)))    // SizeOfRawData
	_ = binary.Write(&syso, binary.LittleEndian, pointerToRawData)         // PointerToRawData
	_ = binary.Write(&syso, binary.LittleEndian, pointerToRelocs)          // PointerToRelocations
	_ = binary.Write(&syso, binary.LittleEndian, uint32(0))                // PointerToLinenumbers
	_ = binary.Write(&syso, binary.LittleEndian, uint16(len(relocOffsets))) // NumberOfRelocations
	_ = binary.Write(&syso, binary.LittleEndian, uint16(0))                // NumberOfLinenumbers
	_ = binary.Write(&syso, binary.LittleEndian, uint32(0x40000040))       // IMAGE_SCN_CNT_INITIALIZED_DATA | IMAGE_SCN_MEM_READ

	// Section Data
	syso.Write(rsrcData)

	// Relocations (10 bytes each)
	for _, off := range relocOffsets {
		_ = binary.Write(&syso, binary.LittleEndian, off)             // VirtualAddress (offset in .rsrc)
		_ = binary.Write(&syso, binary.LittleEndian, uint32(0))        // SymbolTableIndex = 0 (.rsrc)
		_ = binary.Write(&syso, binary.LittleEndian, uint16(3))        // IMAGE_REL_AMD64_ADDR32NB
	}

	// Symbol Table (18 bytes for Symbol 0: ".rsrc")
	var symName [8]byte
	copy(symName[:], ".rsrc")
	syso.Write(symName[:])
	_ = binary.Write(&syso, binary.LittleEndian, uint32(0)) // Value
	_ = binary.Write(&syso, binary.LittleEndian, int16(1))  // SectionNumber = 1
	_ = binary.Write(&syso, binary.LittleEndian, uint16(0)) // Type
	syso.WriteByte(3)                                       // StorageClass = IMAGE_SYM_CLASS_STATIC
	syso.WriteByte(0)                                       // NumberOfAuxSymbols = 0

	// String table: minimum 4 bytes (representing size = 4 when empty)
	_ = binary.Write(&syso, binary.LittleEndian, uint32(4))

	return syso.Bytes(), nil
}
