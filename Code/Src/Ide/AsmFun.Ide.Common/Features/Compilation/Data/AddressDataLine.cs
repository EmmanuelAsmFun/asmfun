using System.Diagnostics;

namespace AsmFun.Ide.Common.Features.Compilation.Data
{
    [DebuggerDisplay("AddressDataLine:Line={Line}:Address={Address.ToString(\"X2\")}")]
    public class AddressDataLine
    {
        public int Line { get; set; }
        public string Address { get; set; }
    }
}
