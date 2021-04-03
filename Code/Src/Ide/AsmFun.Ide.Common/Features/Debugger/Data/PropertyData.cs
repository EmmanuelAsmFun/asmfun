#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using System.Collections.Generic;
using System.Text;

namespace AsmFun.Ide.Common.Features.Debugger.Data
{
    public enum PropertyNumType
    {
        Unknown = 0,
        Byte = 1,
        Int16 = 2,
        Int24 = 3,
        Int32 = 4
    }

    public class PropertyData
    {
        public int DataLength { get; set; }
        public PropertyNumType DataNumType { get; set; }
        public string DataType { get; set; }
        public int DefaultNumValue { get; set; }
        public bool IsBigEndian { get; set; }
        public string Name { get; set; }

    }
}
