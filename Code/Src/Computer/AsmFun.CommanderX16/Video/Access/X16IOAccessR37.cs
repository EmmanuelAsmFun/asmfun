using AsmFun.CommanderX16.Audio;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Core.Sound.Yamaha2151;

namespace AsmFun.CommanderX16.Video.Access
{
    public class X16IOAccessR37 : IX16IOAccess
    {
        private IVideoAccess videoAccess;
        IDisplayComposer displayComposer;
        private readonly IVideoLayerAccess videoLayerAccess;
        private readonly X16VeraSpi veraSpi;
        private readonly Ym2151 ym2151;
        private byte[] io_rddata = new byte[2];
        private uint[] ioAddress;
        private byte[] ioIncrement;
        private byte io_addrsel; // = boolean
        private byte io_dcsel;


        

        /// <summary>
        /// Interrupts will be generated for the interrupt sources set in VERA_IEN
        /// </summary>
        private byte ien = 0;
        /// <summary>
        /// VERA_ISR will indicate interrupts that have occurred. Writing a 1 to a position in VERA_ISR will clear that interrupt status.
        /// </summary>
        private byte isr = 0;
        private readonly IVeraPCM veraPCM;
        private readonly IVeraPsg veraPsg;

        public X16IOAccessR37(IVeraPCM veraPCM, IVeraPsg veraPsg, IDisplayComposer displayComposer, IVideoLayerAccess videoLayerAccess, X16VeraSpi veraSpi, Ym2151 ym2151)
        {
            this.veraPCM = veraPCM;
            this.veraPsg = veraPsg;
            this.displayComposer = displayComposer;
            this.videoLayerAccess = videoLayerAccess;
            this.veraSpi = veraSpi;
            this.ym2151 = ym2151;
        }
        public void Init(IVideoAccess videoAccess)
        {
            this.videoAccess = videoAccess;
        }

        public void Reset()
        {
            ioAddress = new uint[2];
            ioIncrement = new byte[2];
            io_rddata = new byte[2];
            io_rddata[0] = 0;
            io_rddata[1] = 0;
            io_addrsel = 0; // boolean
            ien = 0;
            isr = 0;
            io_dcsel = 0;
            displayComposer.SetIrqLine(0);
            veraPsg.Reset();
            veraPCM.Reset();
        }


        public bool GetIrqOut()
        {
            byte tmp_isr = (byte)(isr | (veraPCM.IsFifoAlmostEmpty() ? 8 : 0));
            return (tmp_isr & ien) != 0;
        }

        private uint GetAndIncAddress(byte sel)
        {
            uint address = ioAddress[sel];
            ioAddress[sel] = (uint)(ioAddress[sel]+ increments[ioIncrement[sel]]);
            return address;
        }

        public void FramePainted()
        {
            // Interrupts will be generated for the interrupt sources set in VERA_IEN
            if ((ien & 1) != 0)
            {
                // VERA_ISR will indicate interrupts that have occurred. Writing a 1 to a position in VERA_ISR will clear that interrupt status.
                // VSYNC IRQ
                isr |= 1;
            }
        }

        public bool IsIrqLine()
        {
            return (ien & 2) != 0;
        }

        public void SetIrqLine()
        {
            isr |= 2;
        }


        /// <summary>
        /// Vera: 6502 I/O Interface
        /// </summary>
        public byte VeraReadIO(byte reg)
        {
            switch (reg)
            {
                case 0:// $9F20 : VERA_ADDR_LO
                    return (byte)((ioAddress[io_addrsel]) & 0xff);
                case 1:// $9F21 : VERA_ADDR_MID
                    return (byte)((ioAddress[io_addrsel] >> 8) & 0xff);
                case 2:// $9F22 : VERA_ADDR_HI
                    return (byte)((ioAddress[io_addrsel] >> 16) | (ioIncrement[io_addrsel ] << 3));
                case 3:// $9F23 : VERA_DATA0
                case 4:// $9F24 : VERA_DATA1
                    {
                        uint address = GetAndIncAddress((byte)(reg - 3));
                        byte value = io_rddata[reg - 3];
                        io_rddata[reg - 3] = videoAccess.Read(ioAddress[reg - 3]);
                        return value;
                    }
                case 5:// $9F25 : VERA_CTRL
                    return (byte)((io_dcsel <<1) | io_addrsel);
                case 0x06: return (byte)(((displayComposer.IrqLine & 1) << 7) | (ien & 0xF));
                case 0x07: return (byte)(isr | (veraPCM.IsFifoAlmostEmpty() ? 8 : 0));
                case 0x08: return (byte)(displayComposer.IrqLine & 0xFF);

                case 0x09: // $9F29
                case 0x0A: // $9F2A
                case 0x0B: // $9F2B
                case 0x0C: // $9F2C
                    return displayComposer.Read((uint)(reg - 0x09 + (io_dcsel >0 ? 4 : 0)));

                case 0x0D: // $9F2D	
                case 0x0E: // $9F2E
                case 0x0F: // $9F2F
                case 0x10: // $9F30
                case 0x11: // $9F31
                case 0x12: // $9F32
                case 0x13: // $9F33
                    return videoLayerAccess.Read(0,(uint)( reg - 0x0D));

                case 0x14:
                case 0x15:
                case 0x16:
                case 0x17:
                case 0x18:
                case 0x19:
                case 0x1A: 
                    return videoLayerAccess.Read(1, (uint)(reg - 0x14));

                case 0x1B: return veraPCM.ReadCtrl();
                case 0x1C: return veraPCM.ReadRate();
                case 0x1D: return 0;

                case 0x1E:
                case 0x1F: return veraSpi.Read((uint)(reg & 1));
            }
            return 0;
        }

        public void VeraWriteIO(byte reg, byte value)
        {
            switch (reg)
            {
                case 0:
                    var add0 = (ioAddress[io_addrsel] & 0x1ff00) | value;
                    ioAddress[io_addrsel] = add0;
                    io_rddata[io_addrsel] = videoAccess.Read(add0);
                    break;
                case 0x01:
                    var add1 = (uint)((ioAddress[io_addrsel] & 0x100ff) | (value << 8));
                    ioAddress[io_addrsel] = add1;
                    io_rddata[io_addrsel] = videoAccess.Read(add1);
                    break;
                case 0x02:
                    var add2 = (uint)((ioAddress[io_addrsel] & 0x0ffff) | ((value & 0x1) << 16));
                    ioAddress[io_addrsel] = add2;
                    ioIncrement[io_addrsel] = (byte)(value >> 3);
                    io_rddata[io_addrsel] = videoAccess.Read(add2);
                    break;
                case 0x03:
                case 0x04:
                    {
                        var address = GetAndIncAddress((byte)(reg - 3));

                        videoAccess.Write(address, value);

                        io_rddata[reg - 3] = videoAccess.Read(ioAddress[reg - 3]);
                        break;
                    }
                case 0x05:
                    if ((value & 0x80) == 0x80)
                    {
                        videoAccess.Reset();
                    }
                    io_dcsel = (byte)((value >> 1) & 1);
                    io_addrsel = (byte)(value & 1);
                    break;
                case 0x06:
                    displayComposer.SetIrqLine(value); 
                    ien = (byte)(value & 0xF);
                    break;
                case 0x07:
                    isr &= (byte)(value ^ 0xff);
                    break;
                case 0x08:
                    break;

                case 0x09:
                case 0x0A:
                case 0x0B:
                case 0x0C:// $9F2C
                    {
                        uint i = (uint)(reg - 0x09 + (io_dcsel > 0 ? 4 : 0));
                        displayComposer.Write(i, value);
                        break;
                    }

                case 0x0D:
                case 0x0E:
                case 0x0F:
                case 0x10:
                case 0x11:
                case 0x12:
                case 0x13:
                    videoLayerAccess.Write(0,(uint)(reg - 0x0D), value);
                    break;

                case 0x14:
                case 0x15:
                case 0x16:
                case 0x17:
                case 0x18:
                case 0x19:
                case 0x1A:
                    videoLayerAccess.Write(1, (uint)(reg - 0x14), value);
                    break;

                case 0x1B: veraPCM.WriteCtrl(value); break;
                case 0x1C: veraPCM.WriteRate(value); break;
                case 0x1D: veraPCM.WriteFifo(value); break;

                case 0x1E:
                case 0x1F:
                    veraSpi.Write((uint)(reg & 1), value);
                    break;
            }
        }

        private int[] increments = new int[] {
                0,   0,
                1,   -1,
                2,   -2,
                4,   -4,
                8,   -8,
                16,  -16,
                32,  -32,
                64,  -64,
                128, -128,
                256, -256,
                512, -512,
                40,  -40,
                80,  -80,
                160, -160,
                320, -320,
                640, -640,
            };
    }
}
