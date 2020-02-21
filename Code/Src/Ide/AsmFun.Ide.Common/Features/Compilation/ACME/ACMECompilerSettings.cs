#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.Ide.Common.Features.Compilation.ACME
{
    public class ACMECompilerSettings : CompilerSettings
    {
        public string ACMEFileName { get; set; }

        public ACMECompilerSettings()
        {
            Type = CompilerTypes.ACME;
        }

        internal override void Parse(CompilerSettings newSettings)
        {
            base.Parse(newSettings);
            ACMEFileName = ((ACMECompilerSettings)newSettings).ACMEFileName;
        }
    }
}
