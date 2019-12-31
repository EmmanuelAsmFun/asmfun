#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Ide.Common.Compilation.Cc65;
using AsmFun.Ide.Common.Data;
using AsmFun.Ide.Common.Data.Programm;
using AsmFun.Ide.DataAccess;
using System;
using System.Collections.Generic;
using System.Text;

namespace AsmFun.Ide.Core.Compilation.Cc65
{
    public class Cc65SourceCodeDA : SourceCodeDA , ICc65SourceCodeDA
    {
        public Cc65SourceCodeDA(IProjectManager projectManager) : base(projectManager)
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
