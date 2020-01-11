using AsmFun.Computer.Common.Video.Data;

namespace AsmFun.CommanderX16.Video.Data
{
    public enum X16SpriteMode
    {
        Bpp4 = 0,
        Bpp8 = 1,
    }
    public class X16VideoSpriteProperties : VideoSpriteProperties
    {
        public X16SpriteMode Mode;
        public uint sprite_address;

        public ushort palette_offset;
    }
}
