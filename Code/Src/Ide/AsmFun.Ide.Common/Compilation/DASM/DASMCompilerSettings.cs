#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.Ide.Common.Compilation.DASM
{
    public class DASMCompilerSettings : CompilerSettings
    {
        public string DASMFolder { get; set; }

        public DASMCompilerSettings()
        {
            Type = CompilerTypes.DASM;
        }

        internal override void Parse(CompilerSettings newSettings)
        {
            base.Parse(newSettings);
            DASMFolder = ((DASMCompilerSettings)newSettings).DASMFolder;
        }
    }
}
