namespace AsmFun.Ide.Core.Compilation.Cc65.Configuration
{
    internal class Cc65Symbol
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public string Value { get; set; }
        public int ValueNum { get; set; } = -1;
        public string Comment { get; set; }
    }
}
