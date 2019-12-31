#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Video.Data;

namespace AsmFun.Computer.Common.Video
{
    public interface ISpriteRegistersAccess : IMemoryAccessable
    {
        bool IsSpritesDisabled();
    }
}