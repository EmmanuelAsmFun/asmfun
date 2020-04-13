using AsmFun.Computer.Common.Video.Data;
using System;

namespace AsmFun.CommanderX16.Video.Painter
{
    public interface ITextPainter
    {
        bool ReadVideo(VideoLayerData layer);
        bool PaintFrame(IntPtr layerBuffer, ushort vStart, byte vScale);
        void RenderLayerLine(ushort y, IntPtr layerBuffer);
    }
}


