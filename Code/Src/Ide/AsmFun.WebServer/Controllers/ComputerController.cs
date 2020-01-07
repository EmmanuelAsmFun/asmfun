﻿#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.Ide.Data.Programm;
using AsmFun.Computer.Common.Data;
using AsmFun.Computer.Common.Managers;
using AsmFun.Computer.Common.Processors;
using AsmFun.Ide;
using AsmFun.Ide.Common.Data.Dissasembly;
using AsmFun.Ide.Common.Managers;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace AsmFun.WebServer.Controllers
{
    public class ComputerController : Controller
    {
        private readonly IComputerManager computerManager;
        private readonly IProcessorManager processorManager;
        private readonly IProjectManager projectManager;

        public ComputerController(IComputerManager computerManager, IProcessorManager manager, IProjectManager projectManager)
        {
            this.computerManager = computerManager;
            this.processorManager = manager;
            this.projectManager = projectManager;
        }

      
        [HttpGet]
        public ProcessorDataModel ResetComputer()
        {
            var data = computerManager.ResetComputer();
            return data;
        } 
        [HttpGet]
        public object StartComputer()
        {
            computerManager.StartComputer();
            return new { ok = true};
        }
        [HttpGet]
        public object StopComputer()
        {
            computerManager.StopComputer();
            return new { ok = true};
        } 
        [HttpGet]
        public object LoadProgram()
        {
            var buildConfiguration = projectManager.GetBuildConfiguration();
            var program =  buildConfiguration?.ProgramFileName;
            computerManager.LoadProgramInPc(program);
            return new { ok = true};
        }
        [HttpGet]
        public object RunProgram()
        {
            computerManager.RunProgram();
            return new { ok = true};
        } 
        [HttpPost]
        public object KeyUp([FromBody] KeyboardKey keyboardKey)
        {
            computerManager.KeyUp(keyboardKey);
            return new { ok = true};
        } 
        [HttpPost]
        public object KeyDown([FromBody]KeyboardKey keyboardKey)
        {
            computerManager.KeyDown(keyboardKey);
            return new { ok = true};
        }
        [HttpPost]
        public object KeyRawUp([FromBody] int[] data,[FromQuery] bool withBreak)
        {
            computerManager.KeyRawUp(data, withBreak);
            return new { ok = true};
        } 
        [HttpPost]
        public object KeyRawDown([FromBody]int[] data)
        {
            computerManager.KeyRawDown(data);
            return new { ok = true};
        }
        [HttpGet]
        public ProcessorDataModel GetData()
        {
            var data = processorManager.GetData();
            return data;
        } 
        [HttpGet]
        public MemoryDumpData[] VideoMemoryDump()
        {
            var data = computerManager.VideoMemoryDump();
            return data;
        }
        public ProcessorStackModel GetStack()
        {
            var data = processorManager.GetStack();
            return data;
        }
        [HttpGet]
        public List<SourceCodeLabel> GetLabels()
        {
            // Return the ordered list by name.
            return processorManager.GetLabels();
        }
        [HttpPost]
        public List<SourceCodeLabel> GetLabelValues([FromBody] List<PropertyData> properties)
        {
            // Return the ordered list by name.
            return processorManager.GetLabelValues(properties);
        }
        [HttpGet]
        public ProcessorDataModel GetProcessorState()
        {
            var data = processorManager.GetData();
            return data;
        }
    }
}