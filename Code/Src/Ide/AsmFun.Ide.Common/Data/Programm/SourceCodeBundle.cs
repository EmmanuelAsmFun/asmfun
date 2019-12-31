#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.Ide.Data.Programm;
using System.Collections.Generic;

namespace AsmFun.Ide.Common.Data.Programm
{
    public class SourceCodeBundle
    {
        public string SourceFileName { get; set; }
        public string Name { get; set; }
        public List<SourceCodeFile> Files { get; set; }
        public List<SourceCodeLabel> Labels { get; set; }
        public SourceCodeBundle()
        {
            Files = new List<SourceCodeFile>();
            Labels = new List<SourceCodeLabel>();
        }

    }
}
