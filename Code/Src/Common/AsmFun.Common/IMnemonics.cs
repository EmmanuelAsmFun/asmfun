#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.Common
{
    public interface IMnemonics
    {
        string GetByOpcode(int opcode);
    }
}
