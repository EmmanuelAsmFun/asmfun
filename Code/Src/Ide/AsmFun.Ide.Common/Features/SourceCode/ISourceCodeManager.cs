#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Ide.Common.Features.Compilation.Data;
using AsmFun.Ide.Common.Features.SourceCode.Data;

namespace AsmFun.Ide.Common.Features.SourceCode
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
