using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Memory;

namespace AsmFun.CommanderX16.Computer
{
    public class X16ComputerAccessR37 : X16ComputerAccessR33
    {
        public X16ComputerAccessR37(ComputerSetupSettings computerSetupSettings, ISymbolsDA symbolsDA) : base(computerSetupSettings, symbolsDA)
        {
        }

        public override MemoryAddressType GetAddressType(int address, int bank = 0)
        {
            if (address < 0x9f00)
            {
                // RAM
                return MemoryAddressType.RAM;
            }
            else if (address < 0xa000)
            {
                // I/O
                if (address >= 0x9f00 && address < 0x9f20)
                {
                    // Sound
                    return MemoryAddressType.Sound;
                }
                else if (address >= 0x9f20 && address < 0x9f40)
                {
                    // Video
                    return MemoryAddressType.Video;
                }
                else if (address >= 0x9f40 && address < 0x9f60)
                {
                    // Character LCD
                    return MemoryAddressType.CharacterLCD;
                }
                else if (address >= 0x9f60 && address < 0x9f70)
                {
                    // Via1
                    return MemoryAddressType.Via1;
                }
                else if (address >= 0x9f70 && address < 0x9f80)
                {
                    // Via2
                    return MemoryAddressType.Via2;
                }
                else if (address >= 0x9f80 && address < 0x9fa0)
                {
                    // RTC
                    return MemoryAddressType.RTC;
                }
                else if (address >= 0x9fa0 && address < 0x9fb0)
                {
                    // fake mouse
                    return MemoryAddressType.Mouse;
                }
                else if (address >= 0x9fb0 && address < 0x9fc0)
                {
                    // Computer state
                    return MemoryAddressType.Computer;
                }
                else if (address >= 0x9fe0 && address <= 0x9fe1)
                {
                    // Yamaha sound
                    return MemoryAddressType.YM2151;
                }
                else
                {
                    return MemoryAddressType.Unknown;
                }
            }
            else if (address < 0xc000)
            { // banked RAM
                return MemoryAddressType.BankedRAM;
            }
            else
            {
                // banked ROM
                return MemoryAddressType.BankedROM;
            }
        }
    }
}
