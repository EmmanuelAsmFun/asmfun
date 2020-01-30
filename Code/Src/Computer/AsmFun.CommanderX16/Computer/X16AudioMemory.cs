using AsmFun.Computer.Core.Computer;
using AsmFun.Computer.Core.DataAccess.Computer;
using System;
using System.Runtime.InteropServices;

namespace AsmFun.CommanderX16.IO
{
    public class X16AudioMemory : MemoryDataAccess , IAudioMemory
    {
        Action<int, int> writeAudio = (a,b) => { };
        private ushort lastAudioAdr;
        public X16AudioMemory() : base(Marshal.AllocHGlobal(2), 2)
        {
            Type = AsmFun.Computer.Common.Computer.Data.MemoryAddressType.YM2151;
        }
        public override void WriteByte(ushort address, int bank, byte value)
        {
            if (address == 0x9fe0)
                lastAudioAdr = value;
            else if (address == 0x9fe1)
                writeAudio(lastAudioAdr, value);
        }
        public override void WriteUShort(int address, ushort value)
        {
            if (address == 0x9fe0)
                lastAudioAdr = value;
            else if (address == 0x9fe1)
                writeAudio(lastAudioAdr, value);
        }
        
        public void SetWriteAudioMethod(Action<int, int> writeAudio)
        {
            this.writeAudio = writeAudio;
        }
    }
}
