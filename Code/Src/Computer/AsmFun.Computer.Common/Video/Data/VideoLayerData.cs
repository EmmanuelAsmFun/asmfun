#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.Computer.Common.Video.Data
{
    public class VideoLayerData
    {
        public bool IsEnabled;

        public byte Mode;
        public uint MapBase;
        public uint TileBase;
        public uint TileSize;

        public bool TextMode;
        public bool TileMode;
        public bool BitmapMode;

        public ushort HorizontalScroll;
        public ushort VerticalScroll;

        public ushort MapWidth;
        public ushort MapWidthMax;
        public ushort MapHeight;
        public ushort MapHeightMax;

        public ushort TileWidth;
        public ushort TileWidthMax;
        public ushort TileHeight;
        public ushort TileHeightMax;

        public ushort LayerWidth;
        public ushort LayerWidthMax;
        public ushort LayerHeight;
        public ushort LayerHeightMax;

        public byte BitsPerPixel;
        public byte PaletteOffset;

        public int LayerIndex;

        public int min_eff_x;
        public int max_eff_x;
        public bool PaintRequireReload = true;

        public VideoLayerData(int layerIndex)
        {
            LayerIndex = layerIndex;
        }

    }
}
