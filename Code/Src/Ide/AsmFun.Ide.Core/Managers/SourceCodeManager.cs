#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Managers;
using AsmFun.Ide.Common.Data.Programm;
using AsmFun.Ide.Common.Managers;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

namespace AsmFun.Ide.Core.Managers
{
    public class SourceCodeManager : ISourceCodeManager
    {
        private readonly IProjectManager projectManager;
        private readonly IComputerManager computerManager;
        private readonly ICompilerManager compilerManager;

        public SourceCodeBundle CurrentSourceCode { get; set; }

        public SourceCodeManager(IProjectManager projectManager, IComputerManager computerManager, ICompilerManager compilerManager)
        {
            this.projectManager = projectManager;
            this.computerManager = computerManager;
            this.compilerManager = compilerManager;
        }

        public SourceCodeBundle GetSourceCode()
        {
            var projectSettings = projectManager.GetCurrentProjectSettings();
            CurrentSourceCode = compilerManager.GetSourceCodeDA().LoadProgram(projectSettings);
            return CurrentSourceCode;
        }

        public SourceCodeBundle GetCurrent()
        {
            if (CurrentSourceCode == null)
                GetSourceCode();
            return CurrentSourceCode;
        }

        public SourceCodeBundle GetSourceWithCompiledAddresses()
        {
            var projectSettings = projectManager.GetCurrentProjectSettings();
            CurrentSourceCode = compilerManager.GetSourceCodeDA().ParseCompiledLabels(projectSettings);
            return CurrentSourceCode;
        }


        public void ParseCodeToDebugger(IComputer computer)
        {
            GetSourceWithCompiledAddresses();
            if (CurrentSourceCode == null  || computer == null) return;
            var allAddresses = new List<ushort>();
            foreach (var file in CurrentSourceCode.Files)
                allAddresses.AddRange(file.Lines
                    .Where(x => !string.IsNullOrWhiteSpace(x.ResultMemoryAddress))
                    .Select(x => ushort.Parse(x.ResultMemoryAddress, NumberStyles.HexNumber)));
            if (allAddresses.Any())
                computer.GetDebugger()?.ParseSourceCodeAddresses(allAddresses);
        }

        public void Save(SourceCodeBundle bundle)
        {
            compilerManager.GetSourceCodeDA().Save(bundle);
        }
    }
}
