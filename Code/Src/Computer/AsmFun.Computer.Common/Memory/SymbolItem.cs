using System.Diagnostics;

namespace AsmFun.Computer.Common.Memory
{
    [DebuggerDisplay("SymbolItem:{Address.ToString(\"X2\")}:{Name}:{Description}")]
    public class SymbolItem
    {
        public int Address { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        /// <summary>
        /// Number of bytes
        /// </summary>
        public int Length { get; set; }
    }
}
