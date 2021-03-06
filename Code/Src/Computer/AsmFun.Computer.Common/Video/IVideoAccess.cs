﻿#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Collections.Generic;
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Memory;

namespace AsmFun.Computer.Common.Video
{
    /// <summary>
    /// The manager video access
    /// </summary>
    public interface IVideoAccess
    {

        void Reset();
        void Step();
        void ProcessorStep();
        byte Read(uint address);
        byte[] ReadBlock(uint address, int length);
        void Write(uint address, byte value);
        bool GetIrqOut();
        void SetDisplay(IComputerDisplay display);
        void LockOnMhz(bool state);
        void LockOnFps(bool state);
        MemoryDumpData[] MemoryDump();
        void WriteBlock(int startAddress, byte[] data, int count);
    }
}