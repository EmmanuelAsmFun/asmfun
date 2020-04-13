#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion


using AsmFun.CommanderX16.Video.Data;
using AsmFun.Computer.Common.Video;

namespace AsmFun.CommanderX16.Video
{
    public class X16IOAccessR33 : IX16IOAccess
    {
        private X16VeraData veraData;
        private IVideoAccess videoAccess;

        public X16IOAccessR33()
        {
        }  
        public void Init(IVideoAccess videoAccess)
        {
            this.videoAccess = videoAccess;
        }

        public void Reset()
        {
            veraData = new X16VeraData();
            veraData.IOAddress = new uint[2];
            veraData.IOIncrement = new byte[2];
            veraData.IsIOAddressSelect = false;
        }


        public bool GetIrqOut()
        {
            return veraData.Isr > 0;
        }

        private uint GetAndIncAddress(byte sel)
        {
            uint address = veraData.IOAddress[sel];
            if (veraData.IOIncrement[sel] > 0)
                veraData.IOAddress[sel] += (uint)(1 << (veraData.IOIncrement[sel] - 1));
            return address;
        }

        public void FramePainted()
        {
            // Interrupts will be generated for the interrupt sources set in VERA_IEN
            if ((veraData.Ien & 1) != 0)
            {
                // VERA_ISR will indicate interrupts that have occurred. Writing a 1 to a position in VERA_ISR will clear that interrupt status.
                // VSYNC IRQ
                veraData.Isr |= 1;
            }
        }

        public bool IsIrqLine()
        {
            return (veraData.Ien & 2) != 0;
        }

        public void SetIrqLine()
        {
            veraData.Isr |= 2;
        }


        /// <summary>
        /// Vera: 6502 I/O Interface
        /// </summary>
        public byte VeraReadIO(byte reg)
        {
            switch (reg)
            {
                case 0:// $9F20 : VERA_ADDR_LO
                    return (byte)((veraData.IOAddress[veraData.IsIOAddressSelect ? 1 : 0]) & 0xff);
                case 1:// $9F21 : VERA_ADDR_MID
                    return (byte)((veraData.IOAddress[veraData.IsIOAddressSelect ? 1 : 0] >> 8) & 0xff);
                case 2:// $9F22 : VERA_ADDR_HI
                    return (byte)((veraData.IOAddress[veraData.IsIOAddressSelect ? 1 : 0] >> 16) | 
                                        (veraData.IOIncrement[veraData.IsIOAddressSelect ? 1 : 0] << 4));
                case 3:// $9F23 : VERA_DATA0
                case 4:// $9F24 : VERA_DATA1
                    {
                        uint address = GetAndIncAddress((byte)(reg - 3));
                        byte value = videoAccess.Read(address);
                        return value;
                    }
                case 5:// $9F25 : VERA_CTRL
                    return (byte)(veraData.IsIOAddressSelect ? 0b1 : 0b0);
                case 6:// $9F26 : VERA_IEN
                    return veraData.Ien;
                case 7:// $9F27 : VERA_ISR
                    return veraData.Isr;
                default:
                    return 0;
            }
        }

        public void VeraWriteIO(byte reg, byte value)
        {
            switch (reg)
            {
                case 0:
                    // $9F20 : VERA_ADDR_LO
                    veraData.IOAddress[veraData.IsIOAddressSelect ? 1 : 0] = 
                                (veraData.IOAddress[veraData.IsIOAddressSelect ? 1 : 0] & 0xfff00) | value;
                    break;
                case 2:
                    // $9F21 : VERA_ADDR_MID
                    veraData.IOAddress[veraData.IsIOAddressSelect ? 1 : 0] = 
                                (uint)((veraData.IOAddress[veraData.IsIOAddressSelect ? 1 : 0] & 0x0ffff) | ((value & 0xf) << 16));
                    veraData.IOIncrement[veraData.IsIOAddressSelect ? 1 : 0] = (byte)(value >> 4);
                    break;
                case 1:
                    // $9F22 : VERA_ADDR_HI
                    veraData.IOAddress[veraData.IsIOAddressSelect ? 1 : 0] = 
                                (uint)((veraData.IOAddress[veraData.IsIOAddressSelect ? 1 : 0] & 0xf00ff) | (value << 8));
                    break;
                case 3: 
                    // $9F23 : VERA_DATA0
                case 4: 
                    // $9F24 : VERA_DATA1
                    {
                        uint address = GetAndIncAddress((byte)(reg - 3));
                        videoAccess.Write(address, value);
                        break;
                    }
                case 5:
                    // $9F25 : VERA_CTRL
                    // BIT 7 = RESET
                    if ((value & 0x80) != 0)
                        videoAccess.Reset();
                    // BIT 0 = ADDRSEL
                    veraData.IsIOAddressSelect = (value & 1) != 0;
                    break;
                case 6:
                    // $9F26 : VERA_IEN
                    veraData.Ien = value;
                    break;
                case 7:
                    // $9F27 : VERA_ISR
                    veraData.Isr &= (byte)(value ^ 0xff);
                    break;

            }
        }

     
    }
}
