#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.Ide.Data.Programm;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Debugger;
using AsmFun.Computer.Common.Processors;
using AsmFun.Ide.Common.Data.Dissasembly;
using System.Collections.Generic;

namespace AsmFun.Computer.Common.Managers
{
    public interface IDebuggerManager
    {
        List<SourceCodeLabel> GetLabels();
        ProcessorDataModel NextStep(bool onlyMyCode);
        ProcessorDataModel StepOver(bool onlyMyCode);
        bool Run();
        ProcessorDataModel ResetPc();
        bool SetBreakpoint(int index, int address, bool state);
        List<DebuggerBreakpoint> GetBreakPoints();
        DissasemblyRange GetDisassembly(int start = 0, int length = 256, int bank = 0);
        SourceCodeLabel ChangeLabelValue(string name, int newValue);

        MemoryBlock GetMemory(int startAddress, int count);
        void WriteVideoMemoryBlock(int startAddress, byte[] data, int count);
        void WriteMemoryBlock(int startAddress, byte[] data, int count);
    }
}
