#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Diagnostics;

namespace AsmFun.Computer.Common.Video.Data
{
    [DebuggerDisplay("LayerLineData:IsEmpty={IsEmpty}:ColorIndex={ColorIndex}:Datas={Datas.length}")]
    public class LayerLineData
    {
        public bool IsEmpty { get; set; }
        public byte[] Datas { get; set; }
        public byte ColorIndex { get; set; }

        public LayerLineData(int length)
        {
            Datas = new byte[length];
        }
    }
}
