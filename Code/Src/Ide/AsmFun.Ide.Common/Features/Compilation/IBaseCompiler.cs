#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Ide.Common.Features.Projects;

namespace AsmFun.Ide.Common.Features.Compilation
{
    public interface IBaseCompiler
    {
        CompilaterResult Compile(BuildConfiguration buildConfiguration);
    }
}
