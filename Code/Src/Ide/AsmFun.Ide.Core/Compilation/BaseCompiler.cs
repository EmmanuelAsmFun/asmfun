#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Ide.Common.Compilation;
using AsmFun.Ide.Common.Compilers;
using AsmFun.Ide.Common.Data;

namespace AsmFun.Ide.Compilation
{
    public abstract class BaseCompiler<TCompilerSettings> : IBaseCompiler
        where TCompilerSettings: CompilerSettings
    {
        protected readonly ProjectSettings projectSettings;
        protected readonly TCompilerSettings compilerSettings;

        public BaseCompiler(ProjectSettings projectSettings, TCompilerSettings compilerSettings)
        {
            this.projectSettings = projectSettings;
            this.compilerSettings = compilerSettings;
        }

        public abstract CompilaterResult Compile(BuildConfiguration configuration);
    }
}
