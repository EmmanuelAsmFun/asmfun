#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Ide.Common.Compilation;
using AsmFun.Ide.Common.DataAccess;

namespace AsmFun.Ide.Common.Managers
{
    public interface ICompilerManager
    {
        CompilaterResult Compile();
        ISourceCodeDA GetSourceCodeDA();
    }
}
