using AsmFun.Computer.Common.Computer.Data;
using System.Diagnostics;

namespace AsmFun.Computer.Common.Data
{
    [DebuggerDisplay("MemoryDumpData:{StartAddress.ToString(\"X2\")}-{EndAddress.ToString(\"X2\")}:{Name}:{MemoryType}")]
    public class MemoryDumpData
    {
        public int StartAddress { get; set; }
        public int EndAddress { get; set; }
        public string Name{ get; set; }
        public byte[] Data{ get; set; }
        public int EndAddressForUI { get; set; }
        public MemoryAddressType MemoryType { get; set; }
    }
}
