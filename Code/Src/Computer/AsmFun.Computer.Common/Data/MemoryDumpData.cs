using System;
using System.Collections.Generic;
using System.Text;

namespace AsmFun.Computer.Common.Data
{
    public class MemoryDumpData
    {
        public int StartAddress { get; set; }
        public int EndAddress { get; set; }
        public string Name{ get; set; }
        public byte[] Data{ get; set; }
        public int EndAddressForUI { get; set; }
    }
}
