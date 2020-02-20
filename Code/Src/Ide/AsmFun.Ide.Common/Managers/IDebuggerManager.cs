#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Debugger;
using AsmFun.Computer.Common.Processors;
using AsmFun.Ide.Common.Data.Dissasembly;
using AsmFun.Ide.Common.Data.Programm;
using System.Collections.Generic;

namespace AsmFun.Computer.Common.Managers
{
    public interface IDebuggerManager
    {
        List<AddressDataLabel> GetLabels();
        ProcessorDataModel NextStep(bool onlyMyCode);
        ProcessorDataModel StepOver(bool onlyMyCode);
        bool Run();
        ProcessorDataModel ResetPc();
        bool SetBreakpoint(int index, int address, bool state, bool isEnabled);
        List<DebuggerBreakpoint> GetBreakPoints();
        DissasemblyRange GetDisassembly(int start = 0, int length = 256, int bank = 0);
        AddressDataLabel ChangeLabelValue(string name, int newValue);

        MemoryBlock GetMemory(int startAddress, int count);
        void WriteVideoMemoryBlock(int startAddress, byte[] data, int count);
        void WriteMemoryBlock(int startAddress, byte[] data, int count);
        bool Break();
    }
}
