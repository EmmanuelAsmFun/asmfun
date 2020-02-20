using System.Diagnostics;

namespace AsmFun.Ide.Core.Compilation.Cc65.CodeMapping
{
    public enum Cc65VariableType
    {
        Unknown,
        RLA,RLZ,REA,REZ
    }

    [DebuggerDisplay("Variable:{Name}:{Address.ToString(\"X2\")}:{Type}")]
    public class Cc65Variable
    {
        public string Name { get; set; }
        public int Address { get; set; }
        public Cc65VariableType Type { get; set; }
    }
}
