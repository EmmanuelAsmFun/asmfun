using System;
using System.Collections.Generic;

namespace AsmFun.Ide.Common.Data.Programm
{
    public class AddressDataFile
    {
        public String FileName { get; set; }
        public String Folder { get; set; }
        public List<AddressDataLine> Lines { get; set; } = new List<AddressDataLine>();
    }
}

