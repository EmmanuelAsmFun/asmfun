#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer.Data;
using System;

namespace AsmFun.Computer.Common.Computer.EventArgss
{
    public class ComputerEventArgs : EventArgs
    {
        public ComputerEventArgs(IComputer computer)
        {
            Computer = computer;
        }

        public IComputer Computer { get; set; }
    }
}
