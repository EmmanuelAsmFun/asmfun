#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Ide.Common.Data.Programm;

namespace AsmFun.Ide.Common.Managers
{
    public interface ISourceCodeManager
    {
        SourceCodeBundle GetSourceCode();
        AddressDataBundle GetCurrentAddressData();
        AddressDataBundle ReloadSourceAddressData();
        void ParseCodeToDebugger(IComputer computer);
        void Save(SourceCodeBundle bundle);
    }
}
