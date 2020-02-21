#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Ide.Common.Features.Compilation.Data;
using AsmFun.Ide.Common.Features.Compilation.VASM;
using AsmFun.Ide.Common.Features.Projects;
using AsmFun.Ide.Common.Features.SourceCode.Data;
using AsmFun.Ide.Core.Features.SourceCode;
using System;

namespace AsmFun.Ide.Core.Features.Compilation.VASM
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

        protected override void LoadLabels(ProjectSettings projectSettings, AddressDataBundle bundle)
        {
            throw new NotImplementedException();
        }

        protected override AddressDataBundle LoadAddressData(ProjectSettings projectSettings, string prgrm)
        {
            throw new NotImplementedException();
        }
    }
}
