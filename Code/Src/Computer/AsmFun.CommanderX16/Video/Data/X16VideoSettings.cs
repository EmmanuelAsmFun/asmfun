#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Video.Data;

namespace AsmFun.CommanderX16.Video
{
    public class X16VideoSettings : VideoSettings
    {
        public uint VideoRamStartADD = 0x00000;
        public uint VideoRamEndADD = 0x20000;
        public uint VideoRamEndADDForUI = 0x1FFFF;
        public uint ComposerStartADD = 0xF0000;
        public uint ComposerEndADD = 0xF1000;
        public uint ComposerEndADDForUI = 0xF001F;
        public uint PaletteStartADD = 0xF1000;
        public uint PaletteEndADD = 0xF2000;
        public uint PaletteEndADDForUI = 0xF11FF;
        public uint Layer1StartADD = 0xF2000;
        public uint Layer1EndADD = 0xF3000;
        public uint Layer1EndADDForUI = 0xF200F;
        public uint Layer2StartADD  = 0xF3000;
        public uint Layer2EndADD = 0xF4000;
        public uint Layer2EndADDForUI = 0xF300F;
        public uint SpritesStartADD = 0xF4000;
        public uint SpritesEndADD = 0xF5000;
        public uint SpritesEndADDForUI = 0xF400F;
        public uint SpriteDataStartADD = 0xF5000;
        public uint SpriteDataEndADD = 0xF6000;
        public uint SpriteDataEndADDForUI = 0xF53FF;
        public uint SpiStartADD = 0xF7000;
        public uint SpiEndADD = 0xF8000;
        public uint SpiEndADDForUI = 0xF7001;
        public uint UartStartADD = 0xF8000;
        public uint UartStartADDForUI = 0xF8000;
        public uint UartEndADD = 0xF9000;

        public int ScanWidth = 800;
        public int ScanHeight = 525;
        public int VgaFrontPorchX = 16;
        public int VgaFrontPorchY = 10;
        public double VgaPixelFrequency = 25.175;
        public int NTSCFrontPorchX = 80;
        public int NTSCFrontPorchY = 22;
        public double NTSCPixelFrequency = (15.750 * 800 / 1000);
        public double TitleSafeX = 0.067;
        public double TitleSafeY = 0.05;


        public int ComposerDataSize;
        

        public X16VideoSettings()
        {
            PaletteSize = 256 * 2;
            NumberOfLayers = 2;
            VideoRAMSize = 0x20000;
            NumberOfSprites = 128;
            Width = 640;
            Height = 480;
            ComposerDataSize = 32;
        }

       
    }
}
