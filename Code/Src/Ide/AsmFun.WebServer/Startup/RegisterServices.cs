#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.Computer;
using AsmFun.Ide;
using AsmFun.Ide.Common.Features.Compilation;
using AsmFun.Ide.Common.Features.Debugger;
using AsmFun.Ide.Common.Features.Files;
using AsmFun.Ide.Common.Features.Ide;
using AsmFun.Ide.Common.Features.Processor;
using AsmFun.Ide.Common.Features.Projects;
using AsmFun.Ide.Common.Features.SourceCode;
using Microsoft.Extensions.DependencyInjection;

namespace AsmFun.WebServer.Startup
{
    internal class RegisterServices
    {
        //public static P6502Manager Manager { get; set; }
        public static void Register(IServiceCollection services, IEmServiceResolverFactory container)
        {
            services.AddSingleton<IEmServiceResolver>(container);
            services.AddSingleton(container.Resolve<IProjectManager>());
            services.AddSingleton(container.Resolve<ISourceCodeManager>());
            services.AddSingleton(container.Resolve<IProcessorManager>());
            services.AddSingleton(container.Resolve<IDebuggerManager>());
            services.AddSingleton(container.Resolve<IComputerManager>());
            services.AddSingleton(container.Resolve<IUserSettingsDA>());
            services.AddSingleton(container.Resolve<ICompilerManager>());
            services.AddSingleton(container.Resolve<IFileManager>());
        }
    }
}
