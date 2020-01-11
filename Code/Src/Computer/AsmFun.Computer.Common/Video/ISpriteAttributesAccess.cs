#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Data;
using AsmFun.Computer.Common.Video.Data;

namespace AsmFun.Computer.Common.Video
{
    public interface ISpriteAttributesAccess : IMemoryAccessable
    {
        byte CalculateColIndex(byte[][] layerLine, bool[] layerLinesEmpty, int eff_x);
        byte CalculateLineColIndex(byte spr_zindex, byte spr_col_index, byte l1_col_index, byte l2_col_index);
        ushort RenderLine(ushort y);
    
        void RenderByColIndex(byte[] spr_col_index, byte[] spr_zindex, int[] eff_x, ushort y);
        void RenderByColIndexNoScale(byte[] spr_col_index,byte[] spr_zindex,  int x, ushort y);
        void SetDisplay(IComputerDisplay display);
    }
    public interface ISpriteAccess
    {
        int NumberOfTotalSprites { get; }

        byte[] ReadSpriteData(int spriteIndex);
        byte[] ReadSpriteColIndexData(int spriteIndex);
        VideoSpriteProperties GetSpriteInfo(int spriteIndex);
    }
}