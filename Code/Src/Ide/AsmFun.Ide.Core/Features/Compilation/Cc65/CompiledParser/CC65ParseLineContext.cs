
using AsmFun.Ide.Core.Features.Compilation.Cc65.Configuration;

namespace AsmFun.Ide.Core.Features.Compilation.Cc65.CompiledParser
{
    internal class CC65ParseLineContext
    {
        public int Address { get; set; }
        public string AddressString { get; set; }
        public int FileDepth { get; set; }
        public string DataChars { get; set; }
        public string CodeChars { get; set; }
        public CC65ParseFileContext FileContext { get; set; }
        public Cc65Segment Segment { get; set; }
        public int DataLength { get; set; }
        public int LineNumber { get; set; }
    }
   
}
