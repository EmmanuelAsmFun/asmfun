using System.Collections.Generic;

namespace AsmFun.Ide.Core.Features.Compilation.Cc65.CompiledParser
{
    internal class CC65ParseFileContext
    {
        public int LastLineNumber { get; set; }
        public string FileName { get; internal set; }
        public List<CC65ParseLineContext> Lines { get; set; }
        public string Folder { get; set; }

        public CC65ParseFileContext()
        {
            Lines = new List<CC65ParseLineContext>();
        }
    }
}
