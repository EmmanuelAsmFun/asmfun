#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Video.Data;
using AsmFun.Computer.Common.Video.Enums;

namespace AsmFun.Computer.Common.Video
{
    public interface IVideoPaletteAccess : IMemoryAccessable
    {
        byte[] Get(int colorIndex);
        PixelColor GetAsPixel(int colorIndex);
        void RefreshIfNeeded(VideoOutModes out_mode, bool chroma_disable);
        int GetFromPalette(byte address);
        void PaletteNeedsToReload();
    }
}