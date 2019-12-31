#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;

namespace AsmFun.Ide.Common.Compilation
{
    public enum CompilerTypes
    {
        Unknown,
        ACME,
        VASM,
        DASM,
        Cc65
    }

    public class CompilerSettings
    {
        public CompilerTypes Type { get; set; }

        internal virtual void Parse(CompilerSettings newSettings)
        {
            
        }
    }
}
