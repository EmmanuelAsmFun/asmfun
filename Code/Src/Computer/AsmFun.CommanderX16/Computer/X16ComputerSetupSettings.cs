#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer.Data;

namespace AsmFun.CommanderX16
{
    public class X16ComputerSetupSettings : ComputerSetupSettings
    {
        public X16ComputerSetupSettings()
        {
            MaxRamBanks = 256;
            NmbrRomBanks = 8;
            NmbrRamBanks = 64; // 512 KB default
            RamSize = 0xa000 + NmbrRamBanks * 8192; // $0000-$9FFF + banks at $A000-$BFFF 
            RomSize = NmbrRomBanks * 16384;         // banks at $C000-$FFFF  =  0x20000 
            RamBankSize = 8192;
            RomBankSize = 16384;
            ComputerType = "CommanderX16";
            ComputerTypeShort = "X16";
            Version = "R37";
            Mhz = 8.33;
        }

        
    }
}
