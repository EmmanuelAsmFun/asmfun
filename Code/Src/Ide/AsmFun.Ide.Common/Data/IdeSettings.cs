#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Ide.Common.Compilation;
using AsmFun.Ide.Common.Compilation.ACME;
using AsmFun.Ide.Common.Compilation.DASM;
using AsmFun.Ide.Common.Compilation.VASM;
using AsmFun.Ide.Common.Compilation.Cc65;
using System.Collections.Generic;
using System.Linq;

namespace AsmFun.Ide.Common.Data
{
    public class IdeSettings
    {
        public string LastProjectFolder { get; set; }
        public string LastProjectMainFile { get; set; }
        public ACMECompilerSettings ACME{ get; set; }
        public VASMCompilerSettings VASM{ get; set; }
        public DASMCompilerSettings DASM { get; set; }
        public Cc65CompilerSettings Cc65 { get; set; }

        public IdeSettings()
        {
            
        }

        public void Parse(IdeSettings ideSettings)
        {
            LastProjectFolder = ideSettings.LastProjectFolder;
            LastProjectMainFile = ideSettings.LastProjectMainFile;
            ACME.Parse(ideSettings.ACME);
            VASM.Parse(ideSettings.VASM);
            DASM.Parse(ideSettings.DASM);
            Cc65.Parse(ideSettings.Cc65);
        }

    }
}
