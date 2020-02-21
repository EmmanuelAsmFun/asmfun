#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Collections.Generic;

namespace AsmFun.Ide.Common.Features.SourceCode.Data
{
    public class SourceCodeBundle
    {
        public string SourceFileName { get; set; }
        public string Name { get; set; }
        public List<SourceCodeFile> Files { get; set; } = new List<SourceCodeFile>();

    }
}
