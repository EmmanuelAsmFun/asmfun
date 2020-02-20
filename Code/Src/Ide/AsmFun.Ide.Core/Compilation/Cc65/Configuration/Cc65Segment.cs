using AsmFun.Ide.Common.Data.Programm;
using System.Collections.Generic;
using System.Diagnostics;

namespace AsmFun.Ide.Core.Compilation.Cc65.Configuration
{
    [DebuggerDisplay("Segment:{Name}:Lines={Lines.Count}:load={Load}:type={Type}")]
    internal class Cc65Segment
    {
        public string Load { get; set; }
        public string Type { get; set; }
        public bool Define { get; set; }
        public string Name { get; set; }
        public List<CC65ParseLineContext> Lines { get; set; }
        public bool Optional { get; internal set; }

        public Cc65Memory Memory { get; set; }

        public Cc65Segment()
        {
            Lines = new List<CC65ParseLineContext>();
        }
    }
}
