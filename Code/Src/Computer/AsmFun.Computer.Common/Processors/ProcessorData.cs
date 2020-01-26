#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using System.Diagnostics;

namespace AsmFun.Computer.Common.Processors
{
    [DebuggerDisplay("PC={ProgramCounter}:sp={StackPointer}:a={A}:x={X}:x={Y}:status={Status}")]
    public class ProcessorData
    {
        public bool IsCarry;
        public bool IsZero;
        public bool IsInterrupt;
        public bool IsDecimal;
        public bool IsOverflow;
        public bool IsSign;

        //6502 CPU registers
        public ushort ProgramCounter;
        public byte StackPointer;
        public byte A;
        public byte X;
        public byte Y;
        public byte Status;


        public uint ClockTicks = 0;
        public uint ClockGoal = 0;
        public ushort PreviousPC;
        public ushort EA;
        public ushort RelativeAddress;
        public byte Opcode;
        public byte PreviousStatus;

        public byte PenaltyOperation;
        public byte PenaltyAddress;

        public string CurrentAddressName;
        /// <summary>
        /// Total instructions executed
        /// </summary>
        public uint instructionsCount = 0;

        public ProcessorDataModel ToModel()
        {
            return new ProcessorDataModel
            {
                ProgramCounter = ProgramCounter,
                StackPointer = StackPointer,
                Status = Status,
                RegisterA = A,
                RegisterX = X,
                RegisterY = Y,
            };
        }
    }
}
