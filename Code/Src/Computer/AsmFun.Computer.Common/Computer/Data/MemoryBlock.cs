#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.Computer.Common.Computer.Data
{
    public class MemoryBlock
    {
        public int StartAddress { get; set; }
        public int Count { get; set; }
        public byte[] Data { get; set; }
    }
}
