#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion


namespace AsmFun.Computer.Common.Video.Data
{
    public class VideoSpriteProperties
    {
        /// <summary>
        /// Sprite Disabled = 0,
        /// Sprite Between BG And Layer0 = 1,
        /// Sprite Between Layer0 And Layer1 = 2,
        /// Sprite In Front Of Layer1 = 3,
        /// </summary>
        public byte ZDepth;

        public short X;
        public short Y;
        public byte Width;
        public byte Height;

        public bool HFlip;
        public bool VFlip;

        public ushort CollisionMask;
    }
}


