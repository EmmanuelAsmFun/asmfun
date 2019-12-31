#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Ide.Common.Compilation.VASM;
using AsmFun.Ide.Common.Data;
using AsmFun.Ide.Common.Data.Programm;
using AsmFun.Ide.DataAccess;
using System;

namespace AsmFun.Ide.Core.Compilation.VASM
{
    public class VASMSourceCodeDA : SourceCodeDA, IVASMSourceCodeDA
    {
        public VASMSourceCodeDA(IProjectManager projectManager) : base(projectManager)
        {
        }

        protected override void InterpretFile(SourceCodeBundle sourceCodeBundle, ProjectSettings projectSettings, string prgrm)
        {
            throw new NotImplementedException();
        }

        protected override void LoadLabels(ProjectSettings projectSettings, SourceCodeBundle bundle)
        {
            throw new NotImplementedException();
        }

        protected override SourceCodeBundle LoadSourceByCompiled(ProjectSettings projectSettings, string prgrm)
        {
            throw new NotImplementedException();
        }
    }
}
