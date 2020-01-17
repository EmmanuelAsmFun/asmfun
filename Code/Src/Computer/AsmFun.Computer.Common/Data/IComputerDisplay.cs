#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using System;

namespace AsmFun.Computer.Common.Data
{
    public interface IComputerDisplay
    {
        void Init(int width, int height);

        void Paint(IntPtr framebuffer, bool bgHasChanged);

        void CloseDisplay();

        void ClockTick(ushort programCounter,double mhzRunning);
        void InitSprites(ISpriteAccess spriteAccess);
        void InitPalette(IVideoPaletteAccess palette);
        void RequireRefreshPalette();
        void RequestRedrawLayer(IntPtr[] layer_lineV, VideoLayerData[] videoLayerDatas);
    }
}
