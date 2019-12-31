#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using AsmFun.Ide.Common.Compilation;
using AsmFun.Ide.Common.Compilation.ACME;
using AsmFun.Ide.Common.Compilation.Cc65;
using AsmFun.Ide.Common.Compilation.DASM;
using AsmFun.Ide.Common.Compilation.VASM;
using AsmFun.Ide.Common.Compilers;
using AsmFun.Ide.Common.Data;
using AsmFun.Ide.Common.DataAccess;
using AsmFun.Ide.Common.Managers;

namespace AsmFun.Ide.Core.Managers
{
    public class CompilerManager : ICompilerManager
    {
        private readonly IEmServiceResolver container;
        private readonly IProjectManager projectManager;

        public CompilerManager(IEmServiceResolver container, IProjectManager projectManager)
        {
            this.container = container;
            this.projectManager = projectManager;
        }

        public CompilaterResult Compile()
        {
            var buildConfiguration = projectManager.GetBuildConfiguration();
            return GetCompiler(buildConfiguration).Compile(buildConfiguration);
        }

      

        public IBaseCompiler GetCompiler()
        {
            return GetCompiler(projectManager.GetBuildConfiguration());
        }
        private IBaseCompiler GetCompiler(BuildConfiguration buildConfiguration)
        {
            switch (buildConfiguration.CompilerType)
            {
                case ProjectCompilerTypes.Unknown:
                    break;
                case ProjectCompilerTypes.ACME: return container.Resolve<IACMECompiler>();
                case ProjectCompilerTypes.VASM: return container.Resolve<IVASMCompiler>();
                case ProjectCompilerTypes.DASM: return container.Resolve<IDASMCompiler>();
                case ProjectCompilerTypes.Cc65: return container.Resolve<ICc65Compiler>();
                default:
                    return null;
            }
            return null;
        }
        public ISourceCodeDA GetSourceCodeDA()
        {
            return GetSourceCodeDA(projectManager.GetBuildConfiguration());
        }
        private ISourceCodeDA GetSourceCodeDA(BuildConfiguration buildConfiguration)
        {
            switch (buildConfiguration.CompilerType)
            {
                case ProjectCompilerTypes.Unknown:
                    break;
                case ProjectCompilerTypes.ACME: return container.Resolve<IACMESourceCodeDA>();
                case ProjectCompilerTypes.VASM: return container.Resolve<IVASMSourceCodeDA>();
                case ProjectCompilerTypes.DASM: return container.Resolve<IDASMSourceCodeDA>();
                case ProjectCompilerTypes.Cc65: return container.Resolve<ICc65SourceCodeDA>();
                default:
                    return null;
            }
            return null;
        }
    }
}
