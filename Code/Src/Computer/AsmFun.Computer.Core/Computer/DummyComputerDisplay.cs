#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using AsmFun.Computer.Common.Data;

namespace AsmFun.Computer.Core.Computer
{
    public class DummyComputerDisplay : IComputerDisplay
    {
        public void ClockTick(ushort programCounter, double mhzRunning)
        {
        }

        public void CloseDisplay()
        {
        }

        public void Init(int width, int height)
        {
        }

        public void Paint(IntPtr ptr)
        {
        }

        public void StartFromProcessor()
        {
            
        }
    }
}
