﻿#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Collections.Generic;
using System.Diagnostics;

namespace AsmFun.Ide.Common.Features.SourceCode.Data
{
    [DebuggerDisplay("SourceCodeFile:{FileName}:Lines={Lines.Count}")]
    public class SourceCodeFile
    {
        public string Folder { get; set; }
        public string FileNameFull { get; set; }
        public List<SourceCodeLine> Lines { get; set; }
        public string FileName { get; set; }
        public bool IsCodeFile { get; set; }
        public bool IsBinary { get; set; }
        public bool Exists { get; set; }
        public bool HasBeenRead { get; set; }
        public bool IsIncludeFile { get; set; }
        public bool RequireSave { get; set; }

        public SourceCodeFile()
        {
            Lines = new List<SourceCodeLine>();
        }
    }
}