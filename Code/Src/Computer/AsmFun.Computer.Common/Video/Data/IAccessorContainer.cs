#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Data;
using System;

namespace AsmFun.Computer.Common.Video.Data
{
    public interface IAccessorContainer
    {
        void AddInOrder(IMemoryAccessable accessor, uint startAddress, uint endAddress, Func<uint, uint> addressTransform
            ,string name = null, uint addEddressForUI=0);
        void Clear();
        void Init();
        void Reset();
        byte Read(uint address);
        byte[] ReadBlock(uint address, int length);
        void Write(uint address, byte value);

        MemoryDumpData[] MemoryDump();
        void WriteBlock(int startAddress, byte[] data, int count);
    }
}