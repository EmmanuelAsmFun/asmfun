#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Ide.Common.Data.Programm;

namespace AsmFun.Ide.Common.Compilation
{
    public class CompilaterResult
    {
        public string ErrorText { get; set; }
        public string RawText { get; set; }
        public AddressDataBundle SourceCodeBundle { get; set; }
        public bool HasErrors { get; set; }
    }
}
