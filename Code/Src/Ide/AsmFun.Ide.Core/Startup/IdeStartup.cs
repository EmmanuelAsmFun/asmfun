#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using AsmFun.Common;
using AsmFun.Common.ServiceLoc;
using AsmFun.Core.DataAccess;
using AsmFun.Computer.Common.Managers;
using AsmFun.Ide.Common.Compilation.ACME;
using AsmFun.Ide.Common.DataAccess;
using AsmFun.Ide.Common.Managers;
using AsmFun.Ide.Compilation;
using AsmFun.Ide.Core.Managers;
using AsmFun.Ide.Managers;
using AsmFun.Ide.Common.Compilation.VASM;
using AsmFun.Ide.Core.Compilation.VASM;
using AsmFun.Ide.Core.Compilation.Cc65;
using AsmFun.Ide.Common.Compilation.Cc65;
using AsmFun.Ide.Core.Compilation.ACME;
using AsmFun.Ide.Core.Compilation.DASM;
using AsmFun.Ide.Common.Compilation.DASM;

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
