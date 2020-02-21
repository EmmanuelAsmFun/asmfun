#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using AsmFun.Common;
using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.Debugger;
using AsmFun.Ide.Common.Features.Compilation;
using AsmFun.Ide.Common.Features.Compilation.ACME;
using AsmFun.Ide.Common.Features.Compilation.Cc65;
using AsmFun.Ide.Common.Features.Compilation.DASM;
using AsmFun.Ide.Common.Features.Compilation.VASM;
using AsmFun.Ide.Common.Features.Debugger;
using AsmFun.Ide.Common.Features.Files;
using AsmFun.Ide.Common.Features.Processor;
using AsmFun.Ide.Common.Features.Projects;
using AsmFun.Ide.Common.Features.SourceCode;
using AsmFun.Ide.Core.Features.Compilation;
using AsmFun.Ide.Core.Features.Compilation.ACME;
using AsmFun.Ide.Core.Features.Compilation.Cc65;
using AsmFun.Ide.Core.Features.Compilation.DASM;
using AsmFun.Ide.Core.Features.Compilation.VASM;
using AsmFun.Ide.Core.Features.Debugger;
using AsmFun.Ide.Core.Features.Files;
using AsmFun.Ide.Core.Features.Processor;
using AsmFun.Ide.Core.Features.Projects;
using AsmFun.Ide.Core.Features.SourceCode;

namespace AsmFun.Ide.Startup
{
    public class IdeStartup : IDisposable
    {
        IEmServiceResolverFactory container;
        public void Configure(IEmServiceResolverFactory container)
        {
            this.container = container;
            container.Add<IProjectSettingsDA, ProjectSettingsDA>().WithLifestyle(EmServiceLifestyle.Singleton);
            container.Add<IProjectManager, ProjectManager>().WithLifestyle(EmServiceLifestyle.Singleton);
            container.Add<IDebuggerManager, DebuggerManager>().WithLifestyle(EmServiceLifestyle.Singleton);
            container.Add<ISourceCodeManager, SourceCodeManager>().WithLifestyle(EmServiceLifestyle.Singleton);
            container.Add<IProcessorManager, ProcessorManager>().WithLifestyle(EmServiceLifestyle.Singleton);
            container.Add<IMnemonics, BaseMnemonics>().WithLifestyle(EmServiceLifestyle.Singleton);
            container.Add<IProjectDA, ProjectDA>().WithLifestyle(EmServiceLifestyle.Singleton);
            container.Add<ILifeMemoryAccess, LifeMemoryAccess>().WithLifestyle(EmServiceLifestyle.Singleton);
            container.Add<IDisassembler, Disassembler>().WithLifestyle(EmServiceLifestyle.Singleton);
            container.Add<ICompilerManager, CompilerManager>().WithLifestyle(EmServiceLifestyle.Singleton);
            container.Add<IFileManager, FileManager>().WithLifestyle(EmServiceLifestyle.Singleton);
            container.Add<IBreakpointsDA, BreakpointsDA>().WithLifestyle(EmServiceLifestyle.Singleton);
            // Transient
            // ACME
            container.Add<IACMECompiler, ACMECompiler>().WithLifestyle(EmServiceLifestyle.Transient);
            container.Add<IACMESourceCodeDA,ACMESourceCodeDA>().WithLifestyle(EmServiceLifestyle.Transient);

            // VASM
            container.Add<IVASMCompiler, VASMCompiler>().WithLifestyle(EmServiceLifestyle.Transient);
            container.Add<IVASMSourceCodeDA,VASMSourceCodeDA>().WithLifestyle(EmServiceLifestyle.Transient);

            // Cc65
            container.Add<ICc65Compiler, Cc65Compiler>().WithLifestyle(EmServiceLifestyle.Transient);
            container.Add<ICc65SourceCodeDA,Cc65SourceCodeDA>().WithLifestyle(EmServiceLifestyle.Transient);

            // DASM
            container.Add<IDASMCompiler, DASMCompiler>().WithLifestyle(EmServiceLifestyle.Transient);
            container.Add<IDASMSourceCodeDA,DASMSourceCodeDA>().WithLifestyle(EmServiceLifestyle.Transient);
        }

        public void Start()
        {
           
        }

        public void Dispose()
        {
            
        }
    }
}
