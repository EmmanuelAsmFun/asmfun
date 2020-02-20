#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Collections.Generic;
using System.Threading.Tasks;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Debugger;
using AsmFun.Computer.Common.Managers;
using AsmFun.Computer.Common.Processors;
using AsmFun.Ide.Common.Data.Dissasembly;
using AsmFun.Ide.Common.Data.Programm;
using AsmFun.Ide.Common.DataAccess;
using AsmFun.Ide.Common.Managers;
using AsmFun.Ide.Compilation;

namespace AsmFun.Ide.Core.Managers
{
    public class DebuggerManager : IDebuggerManager
    {
        private readonly ISourceCodeManager sourceCodeManager;
        private readonly IComputerManager computerManager;
        private readonly ILifeMemoryAccess lifeMemoryAccess;
        private readonly IDisassembler disassembler;

        public DebuggerManager(ISourceCodeManager sourceCodeManager, IComputerManager computerManager, ILifeMemoryAccess lifeMemoryAccess,
            IDisassembler disassembler)
        {
            this.sourceCodeManager = sourceCodeManager;
            this.computerManager = computerManager;
            this.lifeMemoryAccess = lifeMemoryAccess;
            this.disassembler = disassembler;
        }

        public ProcessorDataModel NextStep(bool onlyMyCode)
        {
            var comp = computerManager.GetComputer();
            if (comp == null) return new ProcessorDataModel();
            var debg = comp.GetDebugger();
            if (debg == null) return new ProcessorDataModel();
            debg.NextStep(onlyMyCode);
            // Wait to ensure we have the latest data.
            Task.Delay(100).Wait(); 
            return comp.GetProcessorData();
        }
        public ProcessorDataModel StepOver(bool onlyMyCode)
        {
            var comp = computerManager.GetComputer();
            if (comp == null) return new ProcessorDataModel();
            var debg = comp.GetDebugger();
            if (debg == null) return new ProcessorDataModel();
            debg.StepOver(onlyMyCode);
            // Wait to ensure we have the latest data.
            Task.Delay(100).Wait();
            return comp.GetProcessorData();
        }
        public bool Run()
        {
            var debg = computerManager.GetComputer()?.GetDebugger();
            if (debg == null) return false;
            return debg.Run();
        }   
        public bool Break()
        {
            var comp = computerManager.GetComputer();
            if (comp == null) return false;
            var debg = comp.GetDebugger();
            if (debg == null) return false;
            debg.BreakFromProgram((ushort)comp.GetProcessorData().ProgramCounter);
            return true;
        }
        public ProcessorDataModel ResetPc()
        {
            var comp = computerManager.GetComputer();
            if (comp == null) return new ProcessorDataModel();
            comp.Reset();
            return comp.GetProcessorData();
        }
        public bool SetBreakpoint(int index, int address, bool state, bool isEnabled)
        {
            var debg = computerManager.GetComputer()?.GetDebugger();
            if (debg == null) return false;
            return debg.SetBreakpoint(index,address,state, isEnabled);
        }
        public List<DebuggerBreakpoint> GetBreakPoints()
        {
            var debg = computerManager.GetComputer()?.GetDebugger();
            if (debg == null) return new List<DebuggerBreakpoint>();
            return debg.GetBreakPoints();
        }

        public List<AddressDataLabel> GetLabels()
        {
            return lifeMemoryAccess.GetLabels();
        }


        public DissasemblyRange GetDisassembly(int start = 0, int length = 256, int bank = 0)
        {
            var data = new DissasemblyRange
            {
                StartAdress = start,
                Count = length,
                Bank = bank
            };
            disassembler.ReadRange(data);
            return data;
        }

        public AddressDataLabel ChangeLabelValue(string name, int newValue)
        {
            var comp = computerManager.GetComputer();
            if (comp == null) return null;
            var debg = comp.GetDebugger();
            if (debg == null) return null;
            var label = lifeMemoryAccess.ChangeLabelValue(name, newValue);
            return label;
        }

        public MemoryBlock GetMemory(int startAddress, int count)
        {
            if (startAddress < 0) startAddress = 0;
            if (count > 512) count = 512;
            var comp = computerManager.GetComputer();
            if (comp == null) return new MemoryBlock { StartAddress = startAddress, Count = 0 };
            var memoryBlock = computerManager.GetMemoryBlock(startAddress, count);
            return memoryBlock;
        }

        public void WriteMemoryBlock(int startAddress, byte[] data, int count)
        {
            if (startAddress < 0) startAddress = 0;
            if (count > 2048*10) count = 2048*10;
            var comp = computerManager.GetComputer();
            if (comp == null) return;
            computerManager.WriteMemoryBlock(startAddress, data, count);
        }
        public void WriteVideoMemoryBlock(int startAddress, byte[] data, int count)
        {
            if (startAddress < 0) startAddress = 0;
            if (count > 2048*10) count = 2048*10;
            var comp = computerManager.GetComputer();
            if (comp == null) return;
            computerManager.WriteVideoMemoryBlock(startAddress, data, count);
        }
    }
}
