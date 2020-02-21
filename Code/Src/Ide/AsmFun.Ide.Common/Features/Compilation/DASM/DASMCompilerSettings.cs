#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.Ide.Common.Features.Compilation.DASM
{
    public class DASMCompilerSettings : CompilerSettings
    {
        public string DASMFileName { get; set; }

        public DASMCompilerSettings()
        {
            Type = CompilerTypes.DASM;
        }

        internal override void Parse(CompilerSettings newSettings)
        {
            base.Parse(newSettings);
            DASMFileName = ((DASMCompilerSettings)newSettings).DASMFileName;
        }
    }
}
