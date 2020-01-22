using System;
using System.Collections.Generic;
using System.Text;

namespace AsmFun.Ide.Common.Data.FileExplorer
{
    public class AsmFolder
    {
        public List<AsmFile> Files { get; set; }
        public List<AsmFolder> Folders { get; set; }

        public string Name { get; set; }
        public string Folder{ get; set; }
      

        public AsmFolder()
        {
            Files = new List<AsmFile>();
            Folders = new List<AsmFolder>();
        }
    }
}
