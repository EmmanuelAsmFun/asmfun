#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Ide.Common.Data.Dissasembly;

namespace AsmFun.Ide.Compilation
{
    public interface IDisassembler
    {
        DissasemblyInstructionItem Read(ushort pc, int bank);
        void ReadRange(DissasemblyRange dissasemblyRange);
    }
}