// Heavely inspired from https://github.com/commanderx16/x16-emulator

using AsmFun.CommanderX16.IO;
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Core.DataAccess.Computer;
using System;

namespace AsmFun.CommanderX16.Video.Data
{
    public interface IMemoryViaData
    {
        void Init(MemoryDataAccessDeffered via1registers, MemoryDataAccessDeffered via2registers);
    }
    public class X16MemoryViaDataR33 : MemoryViaData , IMemoryViaData
    {
        private static Random random = new Random();
        private MemoryDataAccessDeffered via1registers;
        private MemoryDataAccessDeffered via2registers;
        private readonly IComputerAccess computerAccess;
        private readonly IX16PS2Access ps2Data;
        private readonly X16JoystickData joystickData;
        private byte via2pb_in;
        //private byte[] via1registerss = new byte[16];
        //private byte[] via2registerss = new byte[16];

        public X16MemoryViaDataR33(IX16PS2Access ps2Data, X16JoystickData joyStickData, IComputerAccess computerAccess)
        {
            this.ps2Data = ps2Data;
            joystickData = joyStickData;
            this.computerAccess = computerAccess;
        }
        public void Init(MemoryDataAccessDeffered via1registers, MemoryDataAccessDeffered via2registers)
        {
            this.via1registers = via1registers;
            this.via2registers = via2registers;
            via1registers.Init(read1, write1);
            via2registers.Init(read2, write2);
        }


        private byte read1(int register, int bank)
        {
            switch (register)
            {
                case 0:
                    return (byte)computerAccess.GetRomBank(); // PB: ROM bank, IEC
                case 1:
                    return (byte)computerAccess.GetRamBank(); // PA: RAM bank
                case 4:
                case 5:
                case 8:
                case 9:
                    return (byte)(random.Next(255) & 0xff);
                default:
                    return  via1registers.ReadMemByte(register); // via1registerss[register];//
            }
        }

        private void write1(int register, int bank, byte data)
        {
            via1registers.WriteMemByte(register, data);
            // via1registerss[register] = data;
            if (register == 0)
            {
                // PB: ROM bank, IEC
                computerAccess.SetRomBank((byte)(data & 7));
            }
            else if (register == 1)
            { // PA: RAM bank
                computerAccess.SetRamBank(data);
            }
            else
            {
            }
        }
        private byte lastVal = 0; 
        public byte read2(int register, int bank)
        {
            switch (register)
            {
                case 0:
                    {
                        // PB
                        // 0 input  -> take input bit
                        // 1 output -> take output bit
                        var via2reg0 = via2registers.ReadMemByte(0);
                        var via2reg2 = via2registers.ReadMemByte(2);
                        //via2reg0 = via2registerss[0];
                        //via2reg2 = via2registerss[2];
                        return (byte)(via2pb_in & (via2reg2 ^ 0xff) | via2reg0 & via2reg2);
                    }

                case 1:
                    {
                        var via2reg3 = via2registers.ReadMemByte(3);
                        //via2reg3 = via2registerss[3];
                        
                        // PA
                        var value = ps2Data.GetValueForViaPA(via2reg3);
                        //if (lastVal != via2reg3)
                        //{
                        //    Console.Write(via2reg3 + "=" + value + ":");
                        //}
                        value = joystickData.GetValueForVia(value);
                        //value = (byte)(value | joyStickValue);
                        return value;
                    }

                default:
                    return via2registers.ReadMemByte(register);// via2registerss[register];
            }
        }

        public void write2(int register, int bank, byte value)
        {
            via2registers.WriteMemByte(register, value);
            //via2registerss[register] = value;
            switch (register)
            {
                case 0:
                    break;
                case 2:
                    break;
                case 1:
                case 3:
                    {
                        // PA
                        var via2reg1 = via2registers.ReadMemByte(1);
                        var via2reg3 = via2registers.ReadMemByte(3);
                        //via2reg1 = via2registerss[1];
                        //via2reg3 = via2registerss[3];
                        //if (via2reg1 != via2reg1)
                        //{

                        //}
                        ps2Data.SetDataFromViaPA(via2reg1, via2reg3);
                        joystickData.SetDataFromVia(via2reg1);
                        break;
                    }
                    // PB
            }
        }


        public MemoryDataAccess GetVia1()
        {
            return via1registers;
        }
        public MemoryDataAccess GetVia2()
        {
            return via2registers;
        }

        public byte PbGetOut()
        {
            var via2reg2 = via2registers.ReadMemByte(2);
            var via2reg0 = via2registers.ReadMemByte(0);
            //via2reg2 = via2registerss[2];
            //via2reg0 = via2registerss[0];
            return (byte)(via2reg2 & via2reg0); // PB
        }

        public void PbSetIn(byte value)
        {
            via2pb_in = value;
        }

        public void SrSet(byte value)
        {
            via2registers.WriteMemByte(10, value);
            // via2registerss[10] = value;
        }


        public override void Dispose()
        {
            via1registers?.Dispose();
            via2registers?.Dispose();
        }


    }
}
