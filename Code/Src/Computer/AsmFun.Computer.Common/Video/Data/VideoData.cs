#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Diagnostics;

namespace AsmFun.Computer.Common.Video.Data
{
    [DebuggerDisplay("Layers={Layers.length}")]
    public class VideoData
    {
        //public LayerData[] Layers { get; private set; }

        //public LayerData this[int index]
        //{
        //    get
        //    {
        //        return Layers[index];
        //    }
        //}


        public VideoData(int numberOfLayers, int width, int height)
        {
            //Layers = new LayerData[numberOfLayers];
            //for (int i = 0; i < Layers.Length; i++)
            //    Layers[i] = new LayerData(width,height);
        }
    }
}
