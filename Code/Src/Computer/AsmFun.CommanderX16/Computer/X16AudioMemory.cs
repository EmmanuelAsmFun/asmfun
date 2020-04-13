using AsmFun.Computer.Core.Computer;
using AsmFun.Computer.Core.DataAccess.Computer;
using AsmFun.Computer.Core.Sound.Yamaha2151;
using System.Runtime.InteropServices;

namespace AsmFun.CommanderX16.IO
{
    public class X16AudioMemory : MemoryDataAccess , IAudioMemory
    {
        private ushort lastAudioAdr;
        private readonly Ym2151 ym2151;

        public X16AudioMemory(Ym2151 ym2151) : base(Marshal.AllocHGlobal(2), 2)
        {
            Type = AsmFun.Computer.Common.Computer.Data.MemoryAddressType.YM2151;
            this.ym2151 = ym2151;
        }
        public override void WriteByte(ushort address, int bank, byte value)
        {
            if (address == 0x9fe0)
                lastAudioAdr = value;
            else if (address == 0x9fe1)
                ym2151.YM_write_reg(lastAudioAdr, value);
        }
        public override void WriteUShort(int address, ushort value)
        {
            if (address == 0x9fe0)
                lastAudioAdr = value;
            else if (address == 0x9fe1)
                ym2151.YM_write_reg(lastAudioAdr, value);
        }
        
    }
}
