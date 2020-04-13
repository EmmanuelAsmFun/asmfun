using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using System;
using System.IO;
using System.Runtime.InteropServices;

namespace AsmFun.CommanderX16.Video.Painter
{
    public class BimapPainter
    {
        private Func<byte, int, byte> BitsPerPxlCalculation;
        private IVideoAccess videoAccess;
        private byte[] videoBytes = null;
        private VideoLayerData layer;
        private int width;
        private int height;
        private uint mapBase;
        private ushort mapWidth;
        private byte bitsPerPixel;
        private int min_eff_x;
        private ushort tileWidth;
        private ushort tileHeight;
        private byte paletteOffset;
        private bool enabled;

        public BimapPainter(IVideoAccess videoAccess, VideoSettings videoSettings)
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
            mapWidth = layer.MapWidth;
            enabled = layer.IsEnabled;
            paletteOffset = (byte)(layer.PaletteOffset << 4);
            var addressSize = tileWidth * tileHeight; // * layer.BitsPerPixel;
            if (addressSize == 0) return false;
            videoBytes = videoAccess.ReadBlock(layer.TileBase, addressSize);
            UpdateBitPerPixelMethod();
            return true;
        }

        public bool PaintFrame(IntPtr layerBuffer, ushort vStart, byte vScale)
        {
            if (!enabled) return false;
            ushort scaledWidth = (ushort)(vScale * (width - vStart) / 128);
            for (ushort y = 0; y < height; y++)
            {
                var eff_y = y;
                var newY = tileHeight > 0 ? eff_y % tileHeight : 0;
                // Additional bytes to reach the correct line of the tile
                uint y_add = (uint)(newY * tileWidth * bitsPerPixel >> 3);

                for (int x = 0; x < width; x++)
                {
                    var newX = tileWidth > 0 ? x % tileWidth : 0;

                    // Additional bytes to reach the correct column of the tile
                    ushort x_add = (ushort)(newX * bitsPerPixel >> 3);
                    // Get the offset address of the tile.
                    uint tile_offset = y_add + x_add;
                    byte color = videoBytes[tile_offset];
                    
                    // Convert tile byte to indexed color
                    var colorIndex = BitsPerPxlCalculation(color, newX);

                    // Apply Palette Offset
                    if (paletteOffset > 0 && colorIndex >0 && colorIndex < 16)
                        colorIndex += paletteOffset;
                    var place = x + eff_y * width;
                    if (place < 41861120)
                        Marshal.WriteByte(layerBuffer + place, colorIndex);
                }
            }
            return true;
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

