#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Collections.Generic;

namespace AsmFun.Computer.Common.Processors
{
    public class ProcessorStackModel
    {
        public ProcessorStackItemModel[] Datas { get; set; }
        public int Count { get; set; }
        public int StartAddress { get; set; }
    }
}
