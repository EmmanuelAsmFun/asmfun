#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Memory;

namespace AsmFun.Computer.Core.Memory
{
    public class AsmMemoryReader : IAsmMemoryReader
    {
        private readonly IComputerManager computerManager;

        public AsmMemoryReader(IComputerManager computerManager)
        {
            this.computerManager = computerManager;
        }

        public void PrepareRange(int address, int length, int bank)
        {

        }

        public int Read(ushort address, int bank)
        {
            var mem = GetMemory();
            if (mem == null) return 0;
            var data = mem.ReadUShort(address);
            return data;
        }

        public byte ReadByte(ushort address, int bank)
        {
            var mem = GetMemory();
            if (mem == null) return 0;
            var data = mem.ReadByte(address);
            return data;
        }
        public int Read(int address, int bank)
        {
            var mem = GetMemory();
            if (mem == null) return 0;
            var data = mem.ReadUShort(address);
            return data;
        }
        private IComputerMemoryAccess GetMemory()
        {
            return computerManager.GetComputer()?.GetMemory();
        }
    }
}
