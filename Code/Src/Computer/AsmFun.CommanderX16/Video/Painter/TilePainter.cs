using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using System;
using System.Runtime.InteropServices;

namespace AsmFun.CommanderX16.Video.Painter
{

    public class TilePainter
    {
        private Func<byte, int, byte> BitsPerPxlCalculation;
        private IVideoAccess videoAccess;
        private byte[] videoBytes = null;
        private byte[] tile_bytes = null;
        VideoLayerData layer;
        private int width;
        private int height;
        private uint mapBase;
        private ushort mapWidth;
        private byte bitsPerPixel;
        private int min_eff_x;
        private ushort tileWidth;
        private ushort tileHeight;
        private uint tileSize;
        private ushort hScroll;
        private ushort vScroll;
        private ushort layerWithMax;
        private ushort layerHeightMax;

        public TilePainter(IVideoAccess videoAccess, VideoSettings videoSettings)
        {
            width = videoSettings.Width;
            height = videoSettings.Height;
            videoBytes = new byte[640 * 480 * 64];
            this.videoAccess = videoAccess;
            bitsPerPixel = 1;
            UpdateBitPerPixelMethod();
        }


        public bool ReadVideo(VideoLayerData layer)
        {
            this.layer = layer;
            mapBase = layer.MapBase;
            bitsPerPixel = layer.BitsPerPixel;
            min_eff_x = layer.min_eff_x;
            tileWidth = layer.TileWidth;
            tileHeight = layer.TileHeight;
            tileSize = layer.TileSize;
            mapWidth = layer.MapWidth;
            hScroll = layer.HorizontalScroll;
            vScroll = layer.VerticalScroll;
            layerWithMax = layer.LayerWidthMax;
            layerHeightMax = layer.LayerHeightMax;
            var addressSize = layer.MapWidth * layer.MapHeight * bitsPerPixel*2;
            if (addressSize == 0) return false;
            videoBytes = videoAccess.ReadBlock(mapBase, addressSize);

            var tilesSize = tileWidth * tileHeight * bitsPerPixel * 128;
            tile_bytes = videoAccess.ReadBlock(layer.TileBase, tilesSize);
            if (layer.PaintRequireReload)
            {
                UpdateBitPerPixelMethod();
                //layer.PaintRequireReload = false;
            }
            return true;
        }

        public bool PaintFrame(IntPtr layerBuffer,ushort vStart, byte vScale)
        {
            for (ushort y = 0; y < height; y++)
            {
                ushort eff_y = (ushort)(vScale * (y - vStart) / 128);
                RenderLayerLine(eff_y, layerBuffer);
            }
            return true;
        }

        public void RenderLayerLine(ushort y, IntPtr layerBuffer)
        {
            if (!layer.IsEnabled) return;
            if (layer.PaintRequireReload)
            {
                UpdateBitPerPixelMethod();
                layer.PaintRequireReload = false;
            }

            int eff_y = PainterCalculations.CalcLayerEffY(vScroll, layerHeightMax, y);
            var map_addr_begin2 = PainterCalculations.CalcLayerMapAddress(tileWidth, tileHeight, mapWidth, min_eff_x, eff_y);
            var map_addr_begin = map_addr_begin2 + mapBase;
            var realY = PainterCalculations.CalcLayerEffY(vScroll, layerHeightMax, y);
            var newY = realY & layer.TileHeightMax;
            for (int x = 0; x < width; x++)
            {
                var realX = PainterCalculations.CalcLayerEffX(hScroll,layerWithMax, x);
                var newX = realX & layer.TileWidthMax;
                uint mapAddress = PainterCalculations.CalcLayerMapAddress(tileWidth, tileHeight, mapWidth, realX, realY) + mapBase - map_addr_begin;

                var byte0 = videoBytes[map_addr_begin2 + mapAddress];
                var byte1 = videoBytes[map_addr_begin2 + mapAddress + 1];
                var tileIndex = (ushort)(byte0 | ((byte1 & 3) << 8));

                // Tile Flipping
                var verticalFlip = ((byte1 >> 3) & 1) != 0;
                var horizontalFlip = ((byte1 >> 2) & 1) != 0;
                var paletteOffset = (byte)((byte1 >> 4)  << 4);

                // offset within tilemap of the current tile
                //tileStart = tile.TileIndex * layer.TileSize;
                var tileStart = tileIndex * tileSize;
                if (verticalFlip)
                    newY = newY ^ tileHeight - 1;
                if (horizontalFlip)
                    newX = newX ^ tileWidth - 1;

                // Additional bytes to reach the correct line of the tile
                uint y_add = (uint)(newY * tileWidth * bitsPerPixel >> 3);
                // Additional bytes to reach the correct column of the tile
                ushort x_add = (ushort)(newX * bitsPerPixel >> 3);
                // Get the offset address of the tile.
                uint tile_offset = tileStart + y_add + x_add;
                var color = tile_bytes[tile_offset];
                
                // Convert tile byte to indexed color
                var colorIndex = BitsPerPxlCalculation(color, newX);

                // Apply Palette Offset
                if (paletteOffset > 0)
                    colorIndex += paletteOffset;
                var place = x + y * width;
                if (place < 41861120)
                    Marshal.WriteByte(layerBuffer + place, colorIndex);
            }
        }


        private void UpdateBitPerPixelMethod()
        {
            // Convert tile byte to indexed color
            switch (bitsPerPixel)
            {
                case 1:
                    BitsPerPxlCalculation = (color, newX) => color;
                    break;
                case 2:
                    BitsPerPxlCalculation = (color, newX) => (byte)(color >> 6 - ((newX & 3) << 1) & 3);
                    break;
                case 4:
                    BitsPerPxlCalculation = (color, newX) => (byte)(color >> 4 - ((newX & 1) << 2) & 0xf);
                    break;
                case 8:
                    BitsPerPxlCalculation = (color, newX) => color;
                    break;
            }
        }


    }
}

