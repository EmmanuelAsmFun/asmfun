// This file is heavely inspired by Mike Chambers (miker00lz@gmail.com) fake6502.c
// Heavely inspired from https://github.com/commanderx16/x16-emulator

using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Processors;
using AsmFun.Computer.Core.Processors.P6502;

namespace AsmFun.Computer.Core.Processors.P65c02
{
    /// <summary>
    ///  65C02 changes.
    ///  Ind         absolute indirect
    ///  A 6502 has a bug whereby if you jmp ($12FF) it reads the address from $12FF and $1200. This has been fixed in the 65C02. 
    /// </summary>
    public class P65c02OpcodeModes : P6502OpcodeModes
    {
        public P65c02OpcodeModes(ProcessorData processorData, IComputerMemoryAccess memoryAccess) 
            : base(processorData, memoryAccess)
        {
        }

        public override void Ind()
        {
            pData.EA = ReadUShort(ReadUShort(pData.ProgramCounter));
            pData.ProgramCounter += 2;
        }

        /// <summary>
        /// Indirect without indexation.  
        /// </summary>
        public virtual void Ind0()
        {
            pData.EA = ReadUShort(Read(pData.ProgramCounter++));
        }

        /// <summary>
        /// Absolute indexed branch
        /// address mode for JMP (Absolute,Indexed)
        /// </summary>
        public virtual void Ainx()
        {
            pData.EA = ReadUShort((ushort)(((ReadUShort(pData.ProgramCounter) + pData.X) & 0xFFFF)+1));
            pData.ProgramCounter += 2;
        }
    }
}
