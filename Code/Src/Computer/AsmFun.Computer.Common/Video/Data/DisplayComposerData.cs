#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Video.Enums;

namespace AsmFun.Computer.Common.Video.Data
{

    public abstract class DisplayComposerData : IDisplayComposer
    {

        /// <summary>
        /// $0F:$0001 :Horizontal Scale
        /// </summary>
        public byte b_HScale { get; set; }
        /// <summary>
        /// $0F:$0002 :Vertical Scale
        /// </summary>
        public byte b_VScale { get; set; }
        public VideoOutModes OutMode { get; protected set; }
        public byte OutModeVG { get; protected set; }
        public bool ChromaDisable { get; protected set; }
        public float HScale { get; protected set; }
        public float VScale { get; protected set; }
        /// <summary>
        /// This value contains the index into palette memory for the display border. If the Output mode is set to 0, this is ignored.
        /// </summary>
        public byte BorderColor { get; protected set; }
        public ushort HStart { get; protected set; }
        public ushort HStop { get; protected set; }
        public ushort VStart { get; protected set; }
        public ushort VStop { get; protected set; }
        public float StepXAdvance { get; protected set; }
        public ushort FrontPorch { get; protected set; }
        public ushort IrqLine { get; protected set; }
        public abstract string Name { get; }

        public bool IsInsideWorkArea(int x, int y)
        {
            return x < HStart || x > HStop || y < VStart || y > VStop;
        }

        public abstract HScales GetHScale();
        public abstract byte[] GetRegComposer();
        public abstract VScales GetVScale();
        public abstract byte Read(uint address);
        public abstract byte[] ReadBlock(uint address, int length);
        public abstract void Reset();
        public abstract void SetRegComposer(byte[] data);
        public abstract void Write(uint address, byte value);
        public abstract void WriteBlock(byte[] bytes, int sourceIndex, int targetIndex, int length);

        public void Init()
        {

        }

        public abstract void MemoryDump(byte[] data, int startAddress);
        public abstract byte[] MemoryDump(int startAddress);
    }
}
