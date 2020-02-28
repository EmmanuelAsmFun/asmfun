#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion


using System.Diagnostics;

namespace AsmFun.Ide.Common.Features.Compilation.Data
{
    [DebuggerDisplay("AddressDataLabel:{Address.ToString(\"X2\")}:{Name}={Value}:Length={Length}")]
    public class AddressDataLabel
    {
        public int Address { get; set; }
        public string Name { get; set; }
        public int Value { get; set; }
        public byte[] Values { get; set; }
        public int Length { get; set; }
    }
}