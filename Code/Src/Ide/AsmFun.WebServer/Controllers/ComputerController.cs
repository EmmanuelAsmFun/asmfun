#region license
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
using System.IO;

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
            var programFileName = Path.GetFileNameWithoutExtension(buildConfiguration.ProgramFileName.Trim(Path.DirectorySeparatorChar));
            var settings = projectManager.GetCurrentProjectSettings();
            if (settings.IsProgramOnly)
            {
                programFileName = buildConfiguration.ProgramFileName;
            }
            else
                programFileName = Path.Combine(settings.Folder, buildConfiguration.OutputFolderName, programFileName + ".prg");
            computerManager.LoadProgramInPc(programFileName);
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
        public ProcessorDataModel GetProcessorData()
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
        [HttpGet]
        public List<MemoryDumpData> GetLoadedMemoryBlocks()
        {
            var data = computerManager.GetLoadedMemoryBlocks();
            return data;
        }
        [HttpGet]
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
        
    }
}
