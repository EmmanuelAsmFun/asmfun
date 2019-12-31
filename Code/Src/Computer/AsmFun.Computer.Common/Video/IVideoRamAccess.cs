#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.Computer.Common.Video
{
    public interface IVideoRamAccess : IMemoryAccessable
    {
        void WriteBlock(uint address, byte[] data, int startIndex, int length);
        void MemoryDumpToFile(string fileName = null);
    }
}