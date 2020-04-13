#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Processors;
using AsmFun.Computer.Core.Debugger;
using AsmFun.Computer.Core.Processors.P6502;
using AsmFun.Computer.Core.Processors.P65c02;

namespace AsmFun.CommanderX16.Computer
{
    public class X16Processor : Processor6502<P65c02Instructions, P65c02OpcodeModes>
    {
        public X16Processor(ProcessorData processorData, P65c02OpcodeModes modes, P65c02Instructions instructions,
            IComputerMemoryAccess computerMemory, P6502InstructionsDB instructionsdb, IDataLogger dataLogger) 
            : base(processorData, modes, instructions, computerMemory, instructionsdb, dataLogger)
        {
        }
    }
}
