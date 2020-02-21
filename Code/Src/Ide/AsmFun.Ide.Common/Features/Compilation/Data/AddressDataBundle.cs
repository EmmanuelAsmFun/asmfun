using System.Collections.Generic;

namespace AsmFun.Ide.Common.Features.Compilation.Data
{
    public class AddressDataBundle
    {
        public string Name { get; set; }
        public List<AddressDataFile> Files { get; set; } = new List<AddressDataFile>();
        public string SourceFileName { get; set; }
        public List<AddressDataLabel> Labels { get; set; } = new List<AddressDataLabel>();
    }
}
