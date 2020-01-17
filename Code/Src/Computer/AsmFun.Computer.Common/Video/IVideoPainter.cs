#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using AsmFun.Computer.Common.Data;

namespace AsmFun.Computer.Common.Video
{
    public interface IVideoPainter : IDisposable
    {
        void Reset();
        bool Step();
        void RequestUpdatePaintProcedure();
        void SetDisplay(IComputerDisplay display);
        void Break(bool doBreak);
        bool ProcessorStep();
        void LockOnProcessor(bool state);
        bool LockOnFps { get; set; }
    }
}