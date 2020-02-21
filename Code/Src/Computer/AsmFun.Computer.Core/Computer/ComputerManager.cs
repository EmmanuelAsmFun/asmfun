#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Computer.EventArgss;
using AsmFun.Computer.Common.IO.Data;
using AsmFun.Computer.Common.Memory;
using AsmFun.Computer.Common.Processors;
using AsmFun.Ide.Common.Features.Ide;
using AsmFun.Ide.Common.Features.SourceCode;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace AsmFun.Computer.Core.Computer
{
    public class ComputerManager : IComputerManager
    {
        private string nextProgramToLoad;
        private ComputerThread computerThread;
        private readonly IEmServiceResolverFactory containerFactory;
        private readonly List<ComputerFactoryItem> ComputerFactories = new List<ComputerFactoryItem>();
        public event EventHandler<ComputerEventArgs> OnInitDisplay;
        public event EventHandler<ComputerEventArgs> OnComputerBuilded;
        public event EventHandler<ComputerEventArgs> OnComputerLoaded;
        public event EventHandler<ComputerEventArgs> OnComputerReady;
        public IComputer Computer { get; private set; }

        public bool IsComputerRunning => Computer != null && Computer.IsRunning;

        public ComputerManager(IEmServiceResolverFactory containerFactory)
        {
            this.containerFactory = containerFactory;
        }

        public void BuildComputer(ComputerSettings computerSettings)
        {
            if (computerSettings == null) throw new ArgumentNullException(nameof(computerSettings));
            var factory = ComputerFactories.FirstOrDefault(item
                => item.ComputerSettings.ComputerType == computerSettings.ComputerType && item.ComputerSettings.ComputerVersion == computerSettings.ComputerVersion);
            if (factory == null || factory.Instantiator == null) return;
            Computer = factory.Instantiator().Create(computerSettings);
            Computer.SoundEnabled = computerSettings.SoundEnabled;
            Computer.OnLoaded += Computer_OnLoaded;
            OnComputerBuilded?.Invoke(this, new ComputerEventArgs(Computer));
        }
        private void PrepareComputer()
        {
            var userSettings = containerFactory.Resolve<IUserSettingsDA>().Get();
            BuildComputer(userSettings.ComputerSettings);
        }

        public void StartComputer(string programToLoad = null)
        {
            nextProgramToLoad = programToLoad;
            if (Computer == null)
                PrepareComputer();
            if (Computer == null || Computer.IsRunning) return;
            if (computerThread != null) return;
            computerThread = new ComputerThread();
            OnInitDisplay?.Invoke(this, new ComputerEventArgs(Computer));
            computerThread.Start(Computer);
        }

        public void StopComputer()
        {
            if (Computer == null) return;
            if (Computer != null)
                Computer.OnLoaded -= Computer_OnLoaded;
            Computer.Dispose();
            computerThread?.Dispose();
            Computer = null;
            computerThread = null;
        }

        public IComputer GetComputer()
        {
            return Computer;
        }

        public ComputerSetupSettings GetSetupSettings()
        {
            if (Computer == null) return null;
            return Computer.GetSetupSettings();
        }

        public IComputerManager AddFactory(ComputerSettings settings, Func<IComputerFactory> instantiator)
        {
            ComputerFactories.Add(new ComputerFactoryItem
            {
                ComputerSettings = settings,
                Instantiator = instantiator
            });
            return this;
        }

        private void Computer_OnLoaded(object sender, EventArgs e)
        {
            OnComputerLoaded?.Invoke(this, new ComputerEventArgs(Computer));
            OnComputerReady?.Invoke(this, new ComputerEventArgs(Computer));
            if (string.IsNullOrWhiteSpace(nextProgramToLoad)) return;
            // Todo: find out why this delay is needed.
            Task.Run(() =>
            {
                Task.Delay(1000).Wait();
                LoadProgramInPc(nextProgramToLoad);
            });
        }

        public void LoadProgramInPc(string programFileName)
        {
            //programFileName = @"D:\Projects\AsmFun\Code\src\UI\AsmFun.WPFDiagnose\bin\Debug\netcoreapp3.0\AsmFun\Projects\Snake_Game\output\main.prg";
            if (string.IsNullOrWhiteSpace(programFileName)) return;
            if (!File.Exists(programFileName)) return;
            if (Computer == null) return;
            //  -prg D:\Temp\x16-VS2\out\Debug\m.prg
            var data = File.ReadAllBytes(programFileName);
            Console.WriteLine("Load:" + programFileName);
            if (Computer == null) return;
            Computer.SetStartFolder(Path.GetDirectoryName(programFileName));
            Computer.LoadProgram(data);
            containerFactory.Resolve<ISourceCodeManager>().ParseCodeToDebugger(Computer);
        }

        public MemoryBlock GetMemoryBlock(int startAddress, int count)
        {
            return Computer?.GetMemoryBlock(startAddress, count);
        }

        public void SetDisplay(IComputerDisplay display)
        {
            if (Computer == null) return;
            Computer.SetDisplay(display);
        }

        public ProcessorDataModel ResetComputer()
        {
            if (Computer == null) return null;
            Computer.Reset();
            return Computer.GetProcessorData();
        }

        public void RunProgram()
        {
            if (Computer == null) return;
            Computer.RunProgram();
        }

        public void KeyDown(KeyboardKey keyboardKey)
        {
            if (Computer == null) return;
            Computer.KeyDown(keyboardKey);
        }

        public void KeyUp(KeyboardKey keyboardKey)
        {
            if (Computer == null) return;
            Computer.KeyUp(keyboardKey);
        }
        public void KeyRawDown(int[] data)
        {
            if (Computer == null) return;
            Computer.KeyRawDown(data);
        }

        public void KeyRawUp(int[] data, bool withBreak)
        {
            if (Computer == null) return;
            Computer.KeyRawUp(data, withBreak);
        }
        public MemoryDumpData[] VideoMemoryDump()
        {
            if (Computer == null) return null;
            return Computer.VideoMemoryDump();
        }

        public void WriteVideoMemoryBlock(int startAddress, byte[] data, int count)
        {
            if (Computer == null) return;
            Computer.WriteVideoMemoryBlock(startAddress, data, count);
        }
        public void WriteMemoryBlock(int startAddress, byte[] data, int count)
        {
            if (Computer == null) return;
            Computer.WriteMemoryBlock(startAddress, data, count);
        }

        public List<MemoryDumpData> GetLoadedMemoryBlocks()
        {
            if (Computer == null) return new List<MemoryDumpData>();
            return Computer.GetLoadedMemoryBlocks();
        }

        private class ComputerFactoryItem
        {
            public ComputerSettings ComputerSettings { get; set; }
            public Func<IComputerFactory> Instantiator { get; set; }
        }
    }
}
