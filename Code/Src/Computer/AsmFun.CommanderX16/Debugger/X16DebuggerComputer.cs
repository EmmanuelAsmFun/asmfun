#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion


using AsmFun.Computer.Common.Debugger;
using AsmFun.Computer.Core.Debugger;
using System.Collections.Generic;

namespace AsmFun.CommanderX16.Computer
{
    public class X16DebuggerComputer : DebuggerComputer
    {
        public override bool DoBreak(ushort programCounter)
        {
            return false;
        }

        public override List<DebuggerBreakpoint> GetBreakPoints()
        {
            return new List<DebuggerBreakpoint>();
        }

        public override bool SetBreakpoint(int index, int address, bool state)
        {
            return false;
        }
    }
}
