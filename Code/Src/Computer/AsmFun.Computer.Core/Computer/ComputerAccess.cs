#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.IO;

namespace AsmFun.Computer.Core.DataAccess.Computer
{
    public abstract class ComputerAccess : IComputerAccess
    {
        public ComputerSetupSettings ComputerSettings { get; }
        public IComputerMemoryAccess Memory { get; set; }
        public MemoryViaData Via { get; set; }
        public JoystickData JoyStick { get; set; }
        public IComputer Computer { get; protected set; }

        public ComputerAccess(ComputerSetupSettings computerSetupSettings)
        {
            ComputerSettings = computerSetupSettings;
        }

        public abstract void LoadROM();

        public virtual MemoryAddressType GetAddressType(int address, int bank = 0)
        {
            // todo: make automated with ComputerMemory
            return MemoryAddressType.Unknown;
        }


        public virtual void SetRamBank(int bank)
        {
            Memory.RamBank = bank;
        }

        public virtual int GetRamBank()
        {
            return Memory.RamBank;
        }

        public virtual void SetRomBank(int bank)
        {
            Memory.RomBank = bank;
        }

        public virtual int GetRomBank()
        {
            return Memory.RomBank;
        }

        public abstract void LoadProgramInPc(byte[] data);

        public void Reset()
        {
            SetRomBank(0);
            SetRamBank(0);
        }



        public void Dispose()
        {
            Via?.Dispose();
            Memory?.Dispose();
        }

      
    }
}
