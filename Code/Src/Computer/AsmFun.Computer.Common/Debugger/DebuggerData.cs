using System.Collections.Generic;

namespace AsmFun.Computer.Common.Debugger
{
    public class DebuggerData
    {
        public List<DebuggerBreakpoint> Breakpoints { get; set; } = new List<DebuggerBreakpoint>();
    }
}
