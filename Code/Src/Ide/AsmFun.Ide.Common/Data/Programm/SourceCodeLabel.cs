#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Diagnostics;

namespace AsmFun.Common.Ide.Data.Programm
{
    public class SourceCodeLabel
    {
        public int Address { get; set; }
        public string Name { get; set; }
        public int Value { get; set; }
        public bool IsZone { get; set; }
        public int VariableLength { get; set; }
    }
}