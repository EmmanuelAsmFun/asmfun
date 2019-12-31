#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Processors;
using System.Collections.Generic;

namespace AsmFun.Computer.Common.Debugger
{
    public interface IDebugger
    {
        void NextStep(bool onlyMyCode);
        void StepOver(bool onlyMyCode);
        bool Run();
        bool SetBreakpoint(int index, int address, bool state);
        List<DebuggerBreakpoint> GetBreakPoints();
        void ParseSourceCodeAddresses(List<ushort> addresses);
    }
}
