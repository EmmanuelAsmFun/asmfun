#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.Ide.Common.Compilation.Cc65
{
    public class Cc65CompilerSettings : CompilerSettings
    {
        public string Cc65Folder { get; set; }

        public Cc65CompilerSettings()
        {
            Type = CompilerTypes.Cc65;
        }

        internal override void Parse(CompilerSettings newSettings)
        {
            base.Parse(newSettings);
            Cc65Folder = ((Cc65CompilerSettings)newSettings).Cc65Folder;
        }
    }
}
