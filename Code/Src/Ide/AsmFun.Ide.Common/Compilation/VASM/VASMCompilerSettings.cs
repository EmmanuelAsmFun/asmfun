#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.Ide.Common.Compilation.VASM
{
    public class VASMCompilerSettings : CompilerSettings
    {
        public string VASMFileName { get; set; }

        public VASMCompilerSettings()
        {
            Type = CompilerTypes.VASM;
        }

        internal override void Parse(CompilerSettings newSettings)
        {
            base.Parse(newSettings);
            VASMFileName = ((VASMCompilerSettings)newSettings).VASMFileName;
        }
    }
}
