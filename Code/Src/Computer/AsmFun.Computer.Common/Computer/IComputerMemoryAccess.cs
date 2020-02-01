#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Processors;
using System;

namespace AsmFun.Computer.Common.Computer
{
    public interface IComputerMemoryAccess : IDisposable
    {
        int RamBank { get; set; }
        int RomBank { get; set; }

        void Reset();
        int GetRealMemoryAddress(MemoryAddressType type);
        int GetStartAddress(MemoryAddressType type);
        int GetEndAddress(MemoryAddressType type);
        byte[] ReadBlock(int address, int length);
        byte[] ReadBlock(MemoryAddressType type,int address, int length);
        byte ReadByte(MemoryAddressType type, ushort address, int bank = 0);
        byte ReadByte(ushort address, int bank = 0);
        ushort ReadUShort(int address);
        void TraceData(MemoryAddressType type, int offset, int length);
        void WriteVideo(ushort address, byte value);
        void WriteByte(ushort address, byte value);
        void WriteByte(ushort address, int bank, byte value);
        void WriteRAM(byte[] bytes, int startIndex = 0);
        void WriteRAM(byte[] bytes, int sourceOffest, int targetOffset, int length);
        void WriteROM(byte[] bytes, int startIndex = 0);
        void WriteUShort(int address, ushort value);
        void WriteBlock(int startAddress, byte[] data, int count);
        void WriteBlock(MemoryAddressType type, byte[] data, int startOffset, int startTargetAddress,  int count);

        ProcessorStackModel ReadStack(int bytesCount);
        void SetWriteAudioMethod(Action<int, int> writeAudio);
    }
}