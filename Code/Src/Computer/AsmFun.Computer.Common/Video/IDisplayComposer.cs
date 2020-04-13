#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Video.Enums;

namespace AsmFun.Computer.Common.Video
{
    public interface IDisplayComposer : IMemoryAccessable
    {
        byte b_VScale { get; }
        byte b_HScale { get; }
        VideoOutModes OutMode { get; }
        byte OutModeVG { get; }
        bool ChromaDisable { get; }
        bool SpritesEnable { get; }
        float HScale { get; }
        float VScale { get; }
        /// <summary>
        /// This value contains the index into palette memory for the display border. If the Output mode is set to 0, this is ignored.
        /// </summary>
        byte BorderColor { get; }
        ushort HStart { get; }
        ushort HStop { get; }
        ushort VStart { get; }
        ushort VStop { get; }
        float StepXAdvance { get; }
        ushort FrontPorch { get; }
        ushort IrqLine { get; }
        HScales GetHScale();
        byte[] GetRegComposer();
        VScales GetVScale();
        void SetRegComposer(byte[] data);
        bool IsInsideWorkArea(int x, int y);
        void SetIrqLine(byte value);
        void Init(IVideoPainter videoPainter);
    }
}