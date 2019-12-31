#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.Computer.Common.Video.Data
{
    public class VideoMapTile
    {
        public byte ForegroundColor;
        public byte BackgroundColor;
        public bool VerticalFlip;
        public bool HorizontalFlip;
        public byte PaletteOffset;
        public ushort TileIndex;
        public VideoLayerData Layer;
    }
}
