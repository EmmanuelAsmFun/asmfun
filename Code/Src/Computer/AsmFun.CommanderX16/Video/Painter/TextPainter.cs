using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using System;
using System.Runtime.InteropServices;

namespace AsmFun.CommanderX16.Video.Painter
{
    public class TextPainter 
    {
        private Func<byte, int, byte,byte, byte> BitsPerPxlCalculation;
        private IVideoLayerAccess LayerAccess;
        private readonly IVideoRamAccess videoRamAccess;
        private IX16VideoMapTileAccess mapTileAccess;
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

        public TextPainter(IX16VideoMapTileAccess mapTileAccess, IVideoLayerAccess layerAccess, IVideoAccess videoAccess, IVideoRamAccess videoRamAccess, VideoSettings videoSettings)
        {
            width = videoSettings.Width;
            height = videoSettings.Height;
            this.mapTileAccess = mapTileAccess;
            this.LayerAccess = layerAccess;
            this.videoRamAccess = videoRamAccess;
            videoBytes = new byte[640 * 480 * 128];
            tile_bytes = new byte[640 * 480 * 128];
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
            var addressSize = layer.MapWidth * layer.MapHeight * layer.BitsPerPixel*2;
            if (addressSize == 0)
            {
                videoBytes = new byte[640 * 480 * 128];
                return false;
            }
            videoBytes = videoAccess.ReadBlock(layer.TileBase, addressSize);

            tile_bytes = videoRamAccess.ReadBlock(mapBase, addressSize *64);
            if (layer.PaintRequireReload)
            {
                UpdateBitPerPixelMethod();
                layer.PaintRequireReload = false;
            }
            return true;
        }

        public bool PaintFrame(IntPtr layerBuffer, ushort vStart, byte vScale)
        {
            for (ushort y = 0; y < height; y++)
            {
                ushort eff_y = (ushort)(vScale * (y - vStart) / 128);
                RenderLayerLine(eff_y, layerBuffer, width);
            }
            return true;
        }

        public void RenderLayerLine(ushort y, IntPtr layerBuffer, int width)
        {
            if (!layer.IsEnabled) return;
            int eff_y = PainterCalculations.CalcLayerEffY(vScroll, layerHeightMax, y);
            var map_addr_begin = PainterCalculations.CalcLayerMapAddress(tileWidth, tileHeight, mapWidth, min_eff_x, eff_y);
            var realY = PainterCalculations.CalcLayerEffY(vScroll, layerHeightMax, y);
            var newY = realY & layer.TileHeightMax;
            for (int x = 0; x < width; x++)
            {
                var realX = PainterCalculations.CalcLayerEffX(hScroll, layerWithMax, x);
                var newX = realX & layer.TileWidthMax;
                uint mapAddress = PainterCalculations.CalcLayerMapAddress(tileWidth, tileHeight, mapWidth, realX, realY) - map_addr_begin;

                var byte0 = tile_bytes[map_addr_begin + mapAddress];
                var byte1 = tile_bytes[map_addr_begin + mapAddress + 1];
                var tileIndex = byte0;
                byte foregroundColor = byte1;
                byte backgroundColor = 0;
                if (layer.Mode == 0)
                {
                    foregroundColor = (byte)(byte1 & 15);
                    backgroundColor = (byte)(byte1 >> 4);
                }
                var tileStart = tileIndex * tileSize;

                // Additional bytes to reach the correct line of the tile
                uint y_add = (uint)(newY * tileWidth * bitsPerPixel >> 3);
                // Additional bytes to reach the correct column of the tile
                ushort x_add = (ushort)(newX * bitsPerPixel >> 3);
                // Get the offset address of the tile.
                uint tile_offset = tileStart + y_add + x_add;
                byte color = videoBytes[tile_offset];
                // Convert tile byte to indexed color
                var colorIndex = BitsPerPxlCalculation(color, newX, foregroundColor, backgroundColor);

                var place = x + y * width;
                if (place < 41861120)
                    Marshal.WriteByte(layerBuffer + place, colorIndex);
            }
        }

        private void Readerr()
        {
            
        }


        private void UpdateBitPerPixelMethod()
        {
            // Convert tile byte to indexed color
            switch (bitsPerPixel)
            {
                case 1:

                    BitsPerPxlCalculation = (color, newX, fg, bg) =>
                    {
                        bool bit = (color >> 7 - newX & 1) != 0;
                        var colorIndex = bit ? fg : bg;
                        return colorIndex;
                    };


                    break;
                case 2:
                    BitsPerPxlCalculation = (color, newX, fg, bg) => (byte)(color >> 6 - ((newX & 3) << 1) & 3);
                    break;
                case 4:
                    BitsPerPxlCalculation = (color, newX, fg, bg) => (byte)(color >> 4 - ((newX & 1) << 2) & 0xf);
                    break;
                case 8:
                    BitsPerPxlCalculation = (color, newX, fg, bg) => color;
                    break;
            }
        }


    }
}


