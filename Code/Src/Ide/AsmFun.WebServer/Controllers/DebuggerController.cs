#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.Ide.Data.Programm;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Debugger;
using AsmFun.Computer.Common.Managers;
using AsmFun.Computer.Common.Processors;
using AsmFun.Ide.Common.Data.Dissasembly;
using AsmFun.Ide.Common.Managers;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace AsmFun.WebServer.Controllers
{
    public class DebuggerController : Controller
    {
        private readonly IDebuggerManager debugger;
        private readonly ISourceCodeManager sourceCodeManager;

        public DebuggerController(IDebuggerManager debugger,  ISourceCodeManager sourceCodeManager)
        {
            this.debugger = debugger;
            this.sourceCodeManager = sourceCodeManager;
        }

        [HttpGet]
        public ProcessorDataModel NextStep(bool onlyMyCode = true)
        {
            var data = debugger.NextStep(onlyMyCode);
            return data;
        }
        [HttpGet]
        public ProcessorDataModel StepOver(bool onlyMyCode = true)
        {
            var data = debugger.StepOver(onlyMyCode);
            return data;
        }
        [HttpGet]
        public object Run()
        {
            var data = debugger.Run();
            return new { isValid= data};
        } 
        [HttpGet]
        public object Break()
        {
            var data = debugger.Break();
            return new { isValid= data};
        }
        [HttpGet]
        public ProcessorDataModel ResetPc()
        {
            var data = debugger.ResetPc();
            return data;
        }
        [HttpGet]
        public object SetBreakpoint(int index, int address, bool state, bool isEnabled)
        {
            var data = debugger.SetBreakpoint(index, address, state, isEnabled);
            return new { isValid = data };
        }
        [HttpGet]
        public List<DebuggerBreakpoint> GetBreakPoints()
        {
            var data = debugger.GetBreakPoints();
            return data;
        }
        [HttpGet]
        public DissasemblyRange GetDisassembly(int start = 0, int length = 256, int bank = 0)
        {
            var data = debugger.GetDisassembly(start,length,bank);
            return data;
        }
        [HttpGet]
        public SourceCodeLabel ChangeLabelValue(string name, int newValue)
        {
            var data = debugger.ChangeLabelValue(name, newValue);
            return data;
        } 
        [HttpGet]
        public MemoryBlock GetMemoryBlock(int startAddress, int count)
        {
            var data = debugger.GetMemory(startAddress, count);
            return data;
        } 
        [HttpPost]
        public object WriteMemoryBlock([FromBody] MemoryBlock data)
        {
            if (data == null || data.Data == null) return new { isValid = true };
            debugger.WriteMemoryBlock(data.StartAddress, data.Data,data.Count);
            return new { isValid = true };
        } 
        [HttpPost]
        public object WriteVideoMemoryBlock([FromBody] MemoryBlock data)
        {
            if (data == null || data.Data == null) return new { isValid = true };
            debugger.WriteVideoMemoryBlock(data.StartAddress, data.Data, data.Count);
            return new { isValid = true };
        }
    }
}
