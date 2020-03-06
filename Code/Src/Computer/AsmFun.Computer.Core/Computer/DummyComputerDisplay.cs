#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;

namespace AsmFun.Computer.Core.Computer
{
    public class DummyComputerDisplay : IComputerDisplay
    {
        public void ClockTick(ushort programCounter, double mhzRunning)
        {
        }

        public void CloseDisplay()
        {
        }

        public int[] GetMouseInfo()
        {
            return new[] { 0, 0,0,0 };
        }

        public void Init(int width, int height)
        {
        }

        public void InitPalette(IVideoPaletteAccess palette)
        {
        }

        public void InitSprites(ISpriteAccess spriteAccess)
        {
        }

        public void Paint(IntPtr ptr, bool bgHasChanged)
        {
        }

        public void RequestRedrawLayer(int layerIndex, IntPtr colorIndexes, VideoLayerData videoLayerDatas)
        {
            
        }

        public void RequestRedrawLayers(IntPtr[] layer_lineV, VideoLayerData[] videoLayerDatas)
        {
        }

        public void RequireRefreshPalette()
        {
        }

        public void StartFromProcessor()
        {
            
        }
    }
}
