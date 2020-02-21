using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AsmFun.Ide.Common.Features.Compilation.Data
{
    [DebuggerDisplay("AddressDataFile:{FileName}:{Folder}:Lines={Lines.Count}")]
    public class AddressDataFile
    {
        public String FileName { get; set; }
        public String Folder { get; set; }
        public List<AddressDataLine> Lines { get; set; } = new List<AddressDataLine>();
    }
}

