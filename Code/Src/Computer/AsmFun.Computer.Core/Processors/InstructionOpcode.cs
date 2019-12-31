#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Processors;
using System;

namespace AsmFun.Computer.Core.Processors
{
    public class InstructionOpcode<TInstructions, TModes>
        where TInstructions : IProcessorInstructions
        where TModes : IProcessorModes
    {
        public Action<TInstructions> OpcodeAction { get; set; }
        public Action<TModes> AddressAction { get; set; }
        public string OpcodeName { get; set; }
        public string OpcodeModeName { get; set; }
        public uint Ticks { get; set; }
        public int Address { get; set; }
    }
}
