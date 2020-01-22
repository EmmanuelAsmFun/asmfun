using System;

namespace AsmFun.Ide.Common.Data.FileExplorer
{
    public class AsmFile
    {
        public string FileName { get; set; }
        public string Folder { get; set; }
        public string Extension { get; set; }
        public long FileSize { get; set; }
        public DateTime Modified { get; set; }
        public string ModifiedString { get; set; }
    }
}
