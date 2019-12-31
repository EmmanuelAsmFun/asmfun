#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Diagnostics;

namespace AsmFun.Computer.Common.Processors
{
    [DebuggerDisplay("PC={ProgramCounter}:sp={StackPointer}:a={RegisterA}:x={RegisterX}:x={RegisterY}:status={Status}")]
    public class ProcessorDataModel
    {
        public int ProgramCounter { get; set; }
        public int StackPointer { get; set; }
        public int RegisterA { get; set; }
        public int RegisterX { get; set; }
        public int RegisterY { get; set; }
        public int Status { get; set; }
        public bool IsCarrySet { get; set; }
        public bool IsZeroFlagSet { get; set; }
        public bool IsBreak { get; set; }
        public bool IsDecimal { get; set; }
        public bool IsConstant { get; set; }
        public bool IsOverflow { get; set; }
    }
}
