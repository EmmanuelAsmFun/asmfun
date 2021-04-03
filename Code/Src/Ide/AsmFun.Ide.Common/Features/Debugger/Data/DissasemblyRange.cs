#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using System.Collections.Generic;

namespace AsmFun.Ide.Common.Features.Debugger.Data
{
    public class DissasemblyRange
    {
        public int StartAdress { get; set; }
        public int Count { get; set; }
        public int Bank { get; set; }
        public List<DissasemblyInstructionItem> Instructions { get; set; }
        public DissasemblyRange()
        {
            Instructions = new List<DissasemblyInstructionItem>();
        }
    }
}
