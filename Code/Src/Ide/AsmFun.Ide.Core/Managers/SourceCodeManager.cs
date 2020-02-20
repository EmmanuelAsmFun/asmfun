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
        public AddressDataBundle CurrentAddressDataBundle { get; set; }

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

        public AddressDataBundle ReloadSourceAddressData()
        {
            var projectSettings = projectManager.GetCurrentProjectSettings();
            CurrentAddressDataBundle = compilerManager.GetSourceCodeDA().ParseCompiledLabels(projectSettings);
            return CurrentAddressDataBundle;
        }


        public void ParseCodeToDebugger(IComputer computer)
        {
            ReloadSourceAddressData();
            if (CurrentAddressDataBundle == null  || computer == null) return;
            var allAddresses = new List<ushort>();
            foreach (var file in CurrentAddressDataBundle.Files)
                allAddresses.AddRange(file.Lines
                    .Where(x => !string.IsNullOrWhiteSpace(x.Address))
                    .Select(x => ushort.Parse(x.Address, NumberStyles.HexNumber)));
            if (allAddresses.Any())
                computer.GetDebugger()?.ParseSourceCodeAddresses(allAddresses);
        }

        public void Save(SourceCodeBundle bundle)
        {
            if (projectManager.GetCurrentProjectSettings().IsProgramOnly) return;
            compilerManager.GetSourceCodeDA().Save(bundle);
        }

        public AddressDataBundle GetCurrentAddressData()
        {
            if (CurrentAddressDataBundle == null)
                ReloadSourceAddressData();
            return CurrentAddressDataBundle;
        }
    }
}
