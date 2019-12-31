#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Diagnostics;

namespace AsmFun.Computer.Common.Video.Data
{
    [DebuggerDisplay("LayerData:Lines={Layers.length}")]
    public class LayerData
    {
        public bool IsEnabled { get; set; }
        public LayerLineData[] Lines { get; private set; }
        public LayerData(int width, int height)
        {
            Lines = new LayerLineData[height];
            for (int i = 0; i < Lines.Length; i++)
            {
                Lines[i] = new LayerLineData(width);
            }
        }
        //public LayerLineData this[int index]
        //{
        //    get
        //    {
        //        return LayerLines[index];
        //    }
        //    set
        //    {
        //        LayerLines[index] = value;
        //    }
        //}
    }
}
