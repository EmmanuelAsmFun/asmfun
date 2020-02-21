#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using AsmFun.Ide.Common.Features.Compilation;
using AsmFun.Ide.Common.Features.Compilation.ACME;
using AsmFun.Ide.Common.Features.Compilation.Cc65;
using AsmFun.Ide.Common.Features.Compilation.DASM;
using AsmFun.Ide.Common.Features.Compilation.VASM;
using AsmFun.Ide.Common.Features.Projects;
using AsmFun.Ide.Common.Features.SourceCode;

namespace AsmFun.Ide.Core.Features.Compilation
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
            if (projectManager.GetCurrentProjectSettings().IsProgramOnly) return new CompilaterResult { };
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
