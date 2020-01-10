#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Data;
using AsmFun.Computer.Common.Debugger;
using AsmFun.Computer.Common.IO;
using AsmFun.Computer.Common.Processors;
using System;

namespace AsmFun.Computer.Common.Computer.Data
{
    public interface IComputer : IDisposable
    {
        /// <summary>
        /// If we want to lock on the Mhz ,like lock on 8 Mhz, depending on the computersettings.
        /// </summary>
        bool LockOnMhz { get; set; }
        bool IsStarting { get; }
        bool IsRunning { get; }

        event EventHandler OnReady;
        event EventHandler OnLoaded;

        void StartComputer();
        ComputerSetupSettings GetSetupSettings();
        IComputerMemoryAccess GetMemory();
        ProcessorDataModel GetProcessorData();
        ProcessorStackModel GetStack();
        IDebugger GetDebugger();
        void Reset();
        void LoadProgram(byte[] data);
        MemoryBlock GetMemoryBlock(int startAddress, int count);
        void SetDisplay(IComputerDisplay display);
        IKeyboardAccess GetKeyboard();
        void RunProgram();
        void KeyDown(KeyboardKey keyboardKey);
        void KeyUp(KeyboardKey keyboardKey);
        void KeyRawDown(int[] keyboardKey);
        void KeyRawUp(int[] keyboardKey, bool withBreak);
        MemoryDumpData[] VideoMemoryDump();
        void WriteVideoMemoryBlock(int startAddress, byte[] data, int count);
        void WriteMemoryBlock(int startAddress, byte[] data, int count);
    }
}
