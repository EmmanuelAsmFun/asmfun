#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion


namespace AsmFun.Computer.Core.Processors
{
    public interface IInstructionDB
    {
        bool IsJump(byte opcode); 
        bool IsRts(byte opcode);
        bool IsRti(byte opcode);
        bool IsJsr(byte opcode);

    }
}