using System.Collections.Generic;
using System.Diagnostics;

namespace AsmFun.Ide.Core.Features.Compilation.Cc65.CodeMapping
{
    [DebuggerDisplay("File:{FileName}:Functions={Functions?.Count}")]
    public class Cc65File
    {
        public string FileName { get; set; }
        public string ObjectFileName { get; set; }
        public List<Cc65Function> Functions { get; set; }
        public List<Cc65Variable> Variables { get; set; }
        public Cc65File()
        {
            Functions = new List<Cc65Function>();
            Variables = new List<Cc65Variable>();
        }
    }
}
