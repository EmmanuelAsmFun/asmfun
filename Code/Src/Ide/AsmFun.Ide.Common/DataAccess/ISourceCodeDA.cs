#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Ide.Common.Data;
using AsmFun.Ide.Common.Data.Programm;

namespace AsmFun.Ide.Common.DataAccess
{
    public interface ISourceCodeDA
    {
        SourceCodeBundle LoadProgram(ProjectSettings projectSettings);
        AddressDataBundle ParseCompiledLabels(ProjectSettings projectSettings);
        void Save(SourceCodeBundle bundle);
    }
}