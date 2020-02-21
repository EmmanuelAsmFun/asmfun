#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion


namespace AsmFun.Computer.Common.Memory
{
    public interface IAsmMemoryReader
    {
        void PrepareRange(int address, int length, int bank);
        int Read(ushort address, int bank);
        int Read(int address, int bank);
        byte ReadByte(ushort address, int bank);
    }
}
