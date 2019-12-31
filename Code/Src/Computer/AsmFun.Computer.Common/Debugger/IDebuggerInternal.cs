#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.Computer.Common.Debugger
{
    public interface IDebuggerInternal : IDebugger
    {
        bool DoBreak(ushort programCounter);

    }
}
