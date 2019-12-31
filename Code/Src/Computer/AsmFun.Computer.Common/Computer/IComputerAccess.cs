#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer.Data;
using System;

namespace AsmFun.Computer.Common.Computer
{
    public interface IComputerAccess : IDisposable
    {
        IComputerMemoryAccess Memory { get; }
        ComputerSetupSettings ComputerSettings { get; }
        IComputer Computer { get; }

        MemoryAddressType GetAddressType(int address, int bank = 0);
        int GetRamBank();
        int GetRomBank();
        void LoadProgramInPc(byte[] data);
        void Reset();
        void SetRamBank(int bank);
        void SetRomBank(int bank);
        void LoadROM();
    }
}