#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.Ide.Common.Data.Dissasembly
{
    public class DissasemblyInstructionItem
    {
        public int Address { get; set; }
        public byte Opcode { get; set; }
        public string OpcodeName { get; set; }
        public int Data1 { get; set; }
        public int Data2 { get; set; }
        public bool IsBranch { get; set; }
        public string DataString { get; set; }
        public int DataLength { get; set; }
        public string LineText { get; set; }
    }
}
