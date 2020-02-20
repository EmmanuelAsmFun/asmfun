using System.Diagnostics;

namespace AsmFun.Ide.Core.Compilation.Cc65.CodeMapping
{
    [DebuggerDisplay("Function:{Name}:{Start.ToString(\"X2\")}-{End.ToString(\"X2\")}:Offset={Offset.ToString(\"X2\")}:Size={Size}({Size.ToString(\"X2\")}):Align={Align}:Fill={Fill}")]
    public class Cc65Function
    {
        public string Name { get; set; }
        public int Offset { get; set; }
        public int Size { get; set; }
        public int Align { get; set; }
        public int Fill { get; set; }
        public int Start { get; set; }
        public int End { get; set; }
        public int TotalSize { get; internal set; }
    }
}
