#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;

namespace AsmFun.Computer.Common.Computer.Data
{
    public class ComputerSetupSettings
    {
        public string ComputerType;
        public string ComputerTypeShort;
        public int MaxRamBanks;
        public int RomSize;
        public int RamSize;
        public int NmbrRomBanks;
        public int NmbrRamBanks;
        public int RamBankSize;
        public int RomBankSize;
        public string Version;
        public int Mhz;
        public bool LockOnMhz { get; set; }
    }
}
