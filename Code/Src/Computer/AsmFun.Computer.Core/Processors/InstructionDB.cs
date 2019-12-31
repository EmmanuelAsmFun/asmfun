#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Processors;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AsmFun.Computer.Core.Processors
{
    public class InstructionDB<TInstructions, TModes> : IInstructionDB
        where TInstructions : IProcessorInstructions
        where TModes : IProcessorModes
    {
        public List<InstructionOpcode<TInstructions, TModes>> opcodesJump = new List<InstructionOpcode<TInstructions, TModes>>(); 
        public List<InstructionOpcode<TInstructions, TModes>> opcodesRts = new List<InstructionOpcode<TInstructions, TModes>>(); 
        public List<InstructionOpcode<TInstructions, TModes>> opcodesJsr = new List<InstructionOpcode<TInstructions, TModes>>(); 
        public List<InstructionOpcode<TInstructions, TModes>> opcodesRti = new List<InstructionOpcode<TInstructions, TModes>>(); 

        public InstructionOpcode<TInstructions, TModes> this[int index] { get { return instr[index]; } set { instr[index] = value; } }

        protected List<InstructionOpcode<TInstructions, TModes>> instr = new List<InstructionOpcode<TInstructions, TModes>>();

        public void A(Action<TInstructions> opcodeAction, string opcodeName, Action<TModes> addressAction, string addressNme, uint ticks)
        {
            var name = opcodeName.Trim();
            var opcode = new InstructionOpcode<TInstructions, TModes>
            {
                OpcodeAction = opcodeAction,
                OpcodeName = name,
                AddressAction = addressAction,
                OpcodeModeName = addressNme.Trim(),
                Ticks = ticks,
                Address = instr.Count,
            };
            instr.Add(opcode);
            switch (name)
            {
                case "jmp": opcodesJump.Add(opcode); break;
                case "jsr": opcodesJsr.Add(opcode); break;
                case "rts": opcodesRts.Add(opcode); break;
                case "rti": opcodesRti.Add(opcode); break;
            }
        }
        public bool IsJump(byte opcode)
        {
            return opcodesJump.Any(x => x.Address == opcode);
        } 
        public bool IsRts(byte opcode)
        {
            return opcodesRts.Any(x => x.Address == opcode);
        } 
        public bool IsRti(byte opcode)
        {
            return opcodesRti.Any(x => x.Address == opcode);
        }
        public bool IsJsr(byte opcode)
        {
            return opcodesJsr.Any(x => x.Address == opcode);
        }
    }
}
