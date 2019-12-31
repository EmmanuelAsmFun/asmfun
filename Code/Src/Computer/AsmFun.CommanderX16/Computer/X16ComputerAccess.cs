#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Core.DataAccess.Computer;
using System.IO;

namespace AsmFun.CommanderX16.Computer
{
    public class X16ComputerAccess : ComputerAccess
    {
        

        public X16ComputerAccess(ComputerSetupSettings computerSetupSettings)
            : base(computerSetupSettings)
        {
        }

        public void Init(IComputer computer, IComputerMemoryAccess computerMemory, MemoryViaData via)
        {
            Computer = computer;
            Memory = computerMemory;
            Via = via;
        }

        public override void LoadROM()
        {
            var bytes = File.ReadAllBytes(Path.Combine(ComputerSettings.ComputerTypeShort, ComputerSettings.Version, "rom.bin"));
            Memory.WriteROM(bytes);
        }

       

        public override void SetRamBank(int bank)
        {
            Memory.RamBank = bank & ComputerSettings.NmbrRamBanks - 1;
        }


        public override void SetRomBank(int bank)
        {
            Memory.RomBank = bank & ComputerSettings.NmbrRomBanks - 1;
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
                else if (address >= 0x9f20 && address < 0x9f28)
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

        public override void LoadProgramInPc(byte[] data)
        {
            if (Memory == null) return;
            // load at 0x0801
            // 00 0B 08 01 00 9E 32 30
            // First two bytes are the length
            var start_lo = data[0];
            var start_hi = data[1];
            var start = start_hi << 8 | start_lo;
            var end = start + data.Length;

            // Skip two first bytes of the length;
            var bufferOffset = 2;
            Memory.WriteRAM(data, bufferOffset, start, data.Length - bufferOffset);
            //ComputerData.Memory.TraceData(MemoryAddressType.RAM, start-2, data.Length);
        }
    }
}
