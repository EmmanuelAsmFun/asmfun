using System.Diagnostics;

namespace AsmFun.Ide.Core.Features.Compilation.Cc65.Configuration
{
    [DebuggerDisplay("Segment:{Name}:File={File}:Size={Size}:SizeNum={SizeNum}")]
    internal class Cc65Memory
    {
        public string Name { get; set; }
        public string File { get; set; }
        public bool Define { get; set; }
        public string Start { get; set; }
        public int StartNum { get; set; } = -1;
        public string Size { get; set; }
        public int SizeNum { get; set; } = -1;
        public int BytesWritten { get; internal set; }
    }
}
