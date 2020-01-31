#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion


using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Data;

namespace AsmFun.Computer.Common
{
    public interface IComputerFactory
    {
        string ComputerType { get; }
        string ComputerVersion { get; }

        IComputer Create(ComputerSettings computerSettings);
    }
}
