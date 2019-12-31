#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.Computer.Common.Video
{
    public interface IMemoryAccessable
    {
        string Name { get; }
        void Reset();
        void Write(uint address, byte value);
        byte Read(uint address);
        byte[] ReadBlock(uint address, int length);
        void WriteBlock(byte[] bytes, int sourceIndex, int targetIndex, int length);
        void Init();
        void MemoryDump(byte[] data, int startInsertAddress);
        byte[] MemoryDump(int startAddress);
    }
}
