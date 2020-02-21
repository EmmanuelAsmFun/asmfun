#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Computer.EventArgss;
using AsmFun.Computer.Common.IO.Data;
using AsmFun.Computer.Common.Memory;
using AsmFun.Computer.Common.Processors;
using System;
using System.Collections.Generic;

namespace AsmFun.Computer.Common.Computer
{
    public interface IComputerManager
    {
        bool IsComputerRunning { get; }

        event EventHandler<ComputerEventArgs> OnInitDisplay;
        event EventHandler<ComputerEventArgs> OnComputerBuilded;
        event EventHandler<ComputerEventArgs> OnComputerLoaded;
        event EventHandler<ComputerEventArgs> OnComputerReady;
        IComputerManager AddFactory(ComputerSettings settings, Func<IComputerFactory> instantiator);
        ProcessorDataModel ResetComputer();
        void BuildComputer(ComputerSettings computerSettings);
        ComputerSetupSettings GetSetupSettings();
        void StartComputer(string programToLoad = null);
        IComputer GetComputer();
        void LoadProgramInPc(string programFileName);
        MemoryBlock GetMemoryBlock(int startAddress, int count);
        void StopComputer();
        void SetDisplay(IComputerDisplay display);
        void RunProgram();
        void KeyDown(KeyboardKey keyboardKey);
        void KeyUp(KeyboardKey keyboardKey);
        void KeyRawUp(int[] data, bool withBreak);
        void KeyRawDown(int[] data);
        MemoryDumpData[] VideoMemoryDump();
        void WriteVideoMemoryBlock(int startAddress, byte[] data, int count);
        void WriteMemoryBlock(int startAddress, byte[] data, int count);
        List<MemoryDumpData> GetLoadedMemoryBlocks();
    }
}
