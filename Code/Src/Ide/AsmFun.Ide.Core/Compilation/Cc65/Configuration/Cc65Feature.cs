namespace AsmFun.Ide.Core.Compilation.Cc65.Configuration
{
    internal class Cc65Feature
    {
        public string Name { get; set; }
        public string StartAddress { get; set; }
        public int StartAddressNum { get; set; } = -1;
        public string Type { get; set; }
        public string Label { get; set; }
        public string Count { get; set; }
        public string SegmentName { get; set; }
        public Cc65Segment Segment { get; set; }
    }
}
