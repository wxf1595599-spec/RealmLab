package main

import (
	"bytes"
	"encoding/binary"
	"fmt"
	"image"
	"image/color"
	"image/png"
	"os"
	"testing"
)

func TestAppIconPNGUsesRealmLabLogoArtwork(t *testing.T) {
	f, err := os.Open("build/appicon.png")
	if err != nil {
		t.Fatal(err)
	}
	defer f.Close()

	img, err := png.Decode(f)
	if err != nil {
		t.Fatal(err)
	}

	assertRealmLabLogoIcon(t, img, 1024)
}

func TestWindowsICOUsesRealmLabLogoArtwork(t *testing.T) {
	for _, size := range []int{16, 24, 32, 48, 64, 256} {
		t.Run(fmt.Sprintf("%dx%d", size, size), func(t *testing.T) {
			img := decodeICOImage(t, "build/windows/icon.ico", size)
			assertRealmLabLogoIcon(t, img, size)
		})
	}
}

func assertRealmLabLogoIcon(t *testing.T, img image.Image, size int) {
	t.Helper()

	bounds := img.Bounds()
	if bounds.Dx() != size || bounds.Dy() != size {
		t.Fatalf("app icon must be square, got %dx%d", bounds.Dx(), bounds.Dy())
	}

	transparentCornerPoints := []struct {
		name string
		x    int
		y    int
	}{
		{"top-left", bounds.Min.X, bounds.Min.Y},
		{"top-right", bounds.Max.X - 1, bounds.Min.Y},
		{"bottom-left", bounds.Min.X, bounds.Max.Y - 1},
		{"bottom-right", bounds.Max.X - 1, bounds.Max.Y - 1},
	}
	for _, point := range transparentCornerPoints {
		if !isTransparent(img.At(point.x, point.y)) {
			t.Fatalf("%s corner must be transparent for the rounded app icon, got %s", point.name, hexColor(img.At(point.x, point.y)))
		}
	}

	visibleEdgePoints := []struct {
		name string
		x    int
		y    int
	}{
		{"top", bounds.Min.X + bounds.Dx()/2, bounds.Min.Y},
		{"right", bounds.Max.X - 1, bounds.Min.Y + bounds.Dy()/2},
		{"bottom", bounds.Min.X + bounds.Dx()/2, bounds.Max.Y - 1},
		{"left", bounds.Min.X, bounds.Min.Y + bounds.Dy()/2},
	}
	for _, point := range visibleEdgePoints {
		if !isPaleRoundedCanvas(img.At(point.x, point.y)) {
			t.Fatalf("%s edge must keep the RealmLab rounded icon canvas visible, got %s", point.name, hexColor(img.At(point.x, point.y)))
		}
	}

	bluePixels := countPixels(img, isRealmLabGlassBlue)
	if bluePixels < minArtworkPixels(size, 9) {
		t.Fatalf("app icon must contain the blue glass code cube, found %d matching pixels", bluePixels)
	}

	canvasPixels := countPixels(img, isPaleRoundedCanvas)
	if canvasPixels < minArtworkPixels(size, 3) {
		t.Fatalf("app icon must contain the pale rounded app canvas, found %d matching pixels", canvasPixels)
	}

	if size >= 48 {
		codePixels := countPixelsInCoreCodeBand(img, isWhiteCodeMark)
		if codePixels < minArtworkPixels(size, 2000) {
			t.Fatalf("app icon must contain the white code mark in the blue cube, found %d matching pixels", codePixels)
		}
	}
}

func isTransparent(colorValue color.Color) bool {
	_, _, _, a := rgba8(colorValue)
	return a <= 0x30
}

func isPaleRoundedCanvas(colorValue color.Color) bool {
	r, g, b, a := rgba8(colorValue)
	return a >= 0xd8 && r >= 230 && g >= 230 && b >= 230
}

func isRealmLabGlassBlue(colorValue color.Color) bool {
	r, g, b, a := rgba8(colorValue)
	return a >= 0xf0 && b >= 165 && g >= 70 && r <= 190 && b >= g+15 && b >= r+45
}

func isWhiteCodeMark(colorValue color.Color) bool {
	r, g, b, a := rgba8(colorValue)
	return a >= 0xf0 && r >= 245 && g >= 245 && b >= 245
}

func rgba8(colorValue color.Color) (uint8, uint8, uint8, uint8) {
	r16, g16, b16, a16 := colorValue.RGBA()
	return uint8(r16 >> 8), uint8(g16 >> 8), uint8(b16 >> 8), uint8(a16 >> 8)
}

func hexColor(colorValue color.Color) string {
	r, g, b, a := rgba8(colorValue)
	return fmt.Sprintf("#%02x%02x%02x/%02x", r, g, b, a)
}

func countPixels(img image.Image, match func(color.Color) bool) int {
	bounds := img.Bounds()
	count := 0
	for y := bounds.Min.Y; y < bounds.Max.Y; y++ {
		for x := bounds.Min.X; x < bounds.Max.X; x++ {
			if match(img.At(x, y)) {
				count++
			}
		}
	}
	return count
}

func countPixelsInCoreCodeBand(img image.Image, match func(color.Color) bool) int {
	bounds := img.Bounds()
	xMin := bounds.Min.X + bounds.Dx()*36/100
	xMax := bounds.Min.X + bounds.Dx()*64/100
	yMin := bounds.Min.Y + bounds.Dy()*40/100
	yMax := bounds.Min.Y + bounds.Dy()*60/100

	count := 0
	for y := yMin; y <= yMax; y++ {
		for x := xMin; x <= xMax; x++ {
			if match(img.At(x, y)) {
				count++
			}
		}
	}
	return count
}

func minArtworkPixels(size int, divisor int) int {
	pixels := (size * size) / divisor
	if pixels < 1 {
		return 1
	}
	return pixels
}

func decodeICOImage(t *testing.T, path string, size int) image.Image {
	t.Helper()

	data, err := os.ReadFile(path)
	if err != nil {
		t.Fatal(err)
	}
	r := bytes.NewReader(data)

	var header struct {
		Reserved uint16
		Type     uint16
		Count    uint16
	}
	if err := binary.Read(r, binary.LittleEndian, &header); err != nil {
		t.Fatal(err)
	}
	if header.Reserved != 0 || header.Type != 1 {
		t.Fatalf("invalid ICO header: reserved=%d type=%d", header.Reserved, header.Type)
	}

	type iconEntry struct {
		Width       uint8
		Height      uint8
		ColorCount  uint8
		Reserved    uint8
		Planes      uint16
		BitCount    uint16
		BytesInRes  uint32
		ImageOffset uint32
	}

	entries := make([]iconEntry, header.Count)
	for i := range entries {
		if err := binary.Read(r, binary.LittleEndian, &entries[i]); err != nil {
			t.Fatal(err)
		}
	}

	expectedSizes := map[int]bool{16: false, 24: false, 32: false, 48: false, 64: false, 256: false}
	targetIndex := -1
	for i, entry := range entries {
		width := int(entry.Width)
		height := int(entry.Height)
		if width == 0 {
			width = 256
		}
		if height == 0 {
			height = 256
		}
		if width != height {
			t.Fatalf("ICO image must be square, got %dx%d", width, height)
		}
		if _, ok := expectedSizes[width]; ok {
			expectedSizes[width] = true
		}
		if width == size {
			targetIndex = i
		}
	}
	for expectedSize, found := range expectedSizes {
		if !found {
			t.Fatalf("ICO is missing %dx%d image", expectedSize, expectedSize)
		}
	}
	if targetIndex < 0 {
		t.Fatalf("ICO is missing %dx%d image", size, size)
	}

	entry := entries[targetIndex]
	end := int(entry.ImageOffset + entry.BytesInRes)
	if end > len(data) {
		t.Fatalf("ICO image offset exceeds file size: offset=%d size=%d file=%d", entry.ImageOffset, entry.BytesInRes, len(data))
	}
	img, err := png.Decode(bytes.NewReader(data[entry.ImageOffset:end]))
	if err != nil {
		t.Fatal(err)
	}
	return img
}
