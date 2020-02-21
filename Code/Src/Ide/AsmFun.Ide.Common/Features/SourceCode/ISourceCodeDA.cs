#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion


using AsmFun.Ide.Common.Features.Compilation.Data;
using AsmFun.Ide.Common.Features.Projects;
using AsmFun.Ide.Common.Features.SourceCode.Data;

namespace AsmFun.Ide.Common.Features.SourceCode
{
    public interface ISourceCodeDA
    {
        SourceCodeBundle LoadProgram(ProjectSettings projectSettings);
        AddressDataBundle ParseCompiledLabels(ProjectSettings projectSettings);
        void Save(SourceCodeBundle bundle);
    }
}