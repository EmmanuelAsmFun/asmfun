#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Diagnostics;

namespace AsmFun.Ide.Common.Data.Programm
{
    [DebuggerDisplay("SourceCodeLine:{LineNumber}:{RawContent}")]
    public class SourceCodeLine
    {
        public int LineNumber { get; set; }
        public string RawContent { get; set; }
        public string ResultMemoryAddress { get; set; }
        public string ByteValues { get; set; }
        public string SourceCode { get; set; }
    }
}