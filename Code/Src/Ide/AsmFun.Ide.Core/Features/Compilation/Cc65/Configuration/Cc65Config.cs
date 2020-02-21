using System.Collections.Generic;

namespace AsmFun.Ide.Core.Features.Compilation.Cc65.Configuration
{
    internal class Cc65Config
    {
        public List<Cc65Feature> Features { get; set; } = new List<Cc65Feature>();
        public List<Cc65Memory> Memories { get; set; } = new List<Cc65Memory>();
        public List<Cc65Segment> Segments { get; set; } = new List<Cc65Segment>();
        public List<Cc65Symbol> Symbols { get; set; } = new List<Cc65Symbol>();
    }
}
