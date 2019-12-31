#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;

namespace AsmFun.Computer.Common.Data
{
    public interface IComputerDisplay
    {
        void Init(int width, int height);

        void Paint(IntPtr framebuffer);

        void CloseDisplay();

        void ClockTick(ushort programCounter,double mhzRunning);
    }
}
