#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Ide.Common.Compilation;
using AsmFun.Ide.Common.Data;

namespace AsmFun.Ide.Common.Compilers
{
    public interface IBaseCompiler
    {
        CompilaterResult Compile(BuildConfiguration buildConfiguration);
    }
}
