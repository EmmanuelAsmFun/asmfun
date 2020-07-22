#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion


using AsmFun.Common.Processors;
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Processors;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Core.Debugger;
using AsmFun.Computer.Core.Processors;

namespace AsmFun.CommanderX16.Computer
{
    public class X16DebuggerComputer : DebuggerComputer
    {
        private readonly IInstructionDB instructionDB;

        public X16DebuggerComputer(ProcessorData processorData, IComputerMemoryAccess computerMemory,IVideoPainter videoPainter, IProcessor processor
            , IInstructionDB instructionDB) 
            : base(processorData, computerMemory, videoPainter, processor)
        {
            this.instructionDB = instructionDB;
        }
        public void Init() { 
        }

        protected override bool IsBranchToAddress(ushort currentAddress, byte opcode, out ushort addressToJump)
        {
            addressToJump = 0;
            //case 0x20: // JSR
            //   case 76: // JMP
            //   case 108: // JMP
            //   case 124: // JMP
            if (instructionDB.IsJump(opcode) || instructionDB.IsJsr(opcode))
            {
                var address = computerMemory.ReadUShort(currentAddress + 1);
                addressToJump = address;
                return true;
            }
            if (instructionDB.IsRts(opcode) || instructionDB.IsRti(opcode))
            {
                addressToJump = processor.StackReadShort();
                return true;
            }
            return false;
        }
    }
}
