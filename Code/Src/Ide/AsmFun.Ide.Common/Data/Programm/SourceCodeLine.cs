#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Diagnostics;

namespace AsmFun.Ide.Common.Data.Programm
{
    [DebuggerDisplay("SourceCodeLine:{LineNumber}:Length={DataLength}:{RawContent}")]
    public class SourceCodeLine
    {
        public int LineNumber { get; set; }
        public string SourceCode { get; set; }
    }
}