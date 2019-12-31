// This file is heavely inspired by Mike Chambers (miker00lz@gmail.com) fake6502.c
// Heavely inspired from https://github.com/commanderx16/x16-emulator
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Processors;

namespace AsmFun.Computer.Core.Processors.P6502
{
    public class P6502OpcodeModes : IProcessorModes
    {
        protected ProcessorData pData;
        private IComputerMemoryAccess memoryAccess;

        public P6502OpcodeModes(ProcessorData processorData, IComputerMemoryAccess memoryAccess)
        {
            pData = processorData;
            this.memoryAccess = memoryAccess;
        }

        /// <summary>
        /// Implied
        /// </summary>
        public void Imp()
        {
        }

        /// <summary>
        /// Accumulator
        /// </summary>
        public void Acc()
        {
        }

        /// <summary>
        /// Immediate
        /// </summary>
        public void Imm()
        {
            pData.EA = pData.ProgramCounter++;
        }

        /// <summary>
        /// ZeroPage 
        /// </summary>
        public void Zp()
        {
            pData.EA = Read(pData.ProgramCounter++);
        }

        /// <summary>
        /// ZeroPage X
        /// </summary>
        public void Zpx()
        {
            pData.EA = (ushort)(Read(pData.ProgramCounter++) + pData.X & 0xFF);
        }
        /// <summary>
        /// ZeroPage Y
        /// </summary>
        public void Zpy()
        {
            pData.EA = (ushort)(Read(pData.ProgramCounter++) + pData.Y & 0xFF);
        }

        /// <summary>
        /// Relative for branch ops (8-bit immediate value, sign-extended)
        /// </summary>
        public void Rel()
        {
            pData.RelativeAddress = Read(pData.ProgramCounter++);
            if ((pData.RelativeAddress & 0x80) != 0)
                pData.RelativeAddress |= 0xFF00;
        }

        /// <summary>
        /// Absolute
        /// </summary>
        public void Abso()
        {
            pData.EA = ReadUShort(pData.ProgramCounter); //(ushort)(Read(pData.PC) | Read((ushort)(pData.PC + 1)) << 8);
            pData.ProgramCounter += 2;
        }

        /// <summary>
        /// Absolute X
        /// </summary>
        public void Absx()
        {
            pData.EA = ReadUShort(pData.ProgramCounter);  //(ushort)(Read(pData.PC) | Read((ushort)(pData.PC + 1)) << 8);
            var startpage = (ushort)(pData.EA & 0xFF00);
            pData.EA += pData.X;

            if (startpage != (pData.EA & 0xFF00)) // One cycle penalty for page-crossing on some opcodes
                pData.PenaltyAddress = 1;

            pData.ProgramCounter += 2;
        }

        /// <summary>
        /// Absolute Y
        /// </summary>
        public void Absy()
        {
            pData.EA = ReadUShort(pData.ProgramCounter); // (ushort)(Read(pData.PC) | Read((ushort)(pData.PC + 1)) << 8);
            var startpage = (ushort)(pData.EA & 0xFF00);
            pData.EA += pData.Y;

            if (startpage != (pData.EA & 0xFF00)) // One cycle penalty for page-crossing on some opcodes
                pData.PenaltyAddress = 1;


            pData.ProgramCounter += 2;
        }

        /// <summary>
        /// Indirect
        /// </summary>
        public virtual void Ind()
        {
            pData.EA = ReadUShort(Read(pData.ProgramCounter));
            pData.ProgramCounter += 2;
        }

        /// <summary>
        /// Indirect X
        /// </summary>
        public void Indx()
        {
            pData.EA = ReadUShort((ushort)(Read(pData.ProgramCounter++) + pData.X & 0xFF));
        }

        /// <summary>
        /// Indirect Y
        /// </summary>
        public void Indy()
        {
            pData.EA = ReadUShort(Read(pData.ProgramCounter++));
            var startpage = (ushort)(pData.EA & 0xFF00);
            pData.EA += pData.Y;

            if (startpage != (pData.EA & 0xFF00)) // One cycle penalty for page-crossing on some opcodes
                pData.PenaltyAddress = 1;
        }

        protected virtual byte Read(ushort address)
        {
            return memoryAccess.ReadByte(address);
        }
        protected virtual ushort ReadUShort(ushort address)
        {
            return memoryAccess.ReadUShort(address);
        }
        public virtual void Ainx()
        {
            pData.EA = ReadUShort((ushort)(ReadUShort(pData.ProgramCounter) + pData.X & 0xFFFF));
            pData.ProgramCounter += 2;
        }
    }
}
