#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using System.Collections.Generic;
using System.Text;

namespace AsmFun.Computer.Common.Computer.Data
{
    public interface IIntructionData
    {
        /// <summary>
        /// Keep track of total instructions executed
        /// </summary>
        int Instructions { get; set; }
        int Clockticks6502 { get; set; }
        int Clockgoal6502 { get; set; }
        short Oldpc { get; set; }
        short Ea { get; set; }
        short Reladdr { get; set; }
        short Value { get; set; }
        short Result { get; set; }
        byte Opcode { get; set; }
        byte Oldstatus { get; set; }
        byte PenaltyOp { get; set; }
        byte PenaltyAddr { get; set; }

    }
}
