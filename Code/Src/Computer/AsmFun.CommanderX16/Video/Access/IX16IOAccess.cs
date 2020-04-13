#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion


using AsmFun.Computer.Common.Video;

namespace AsmFun.CommanderX16.Video
{
    public interface IX16IOAccess
    {
        void Reset();
        bool GetIrqOut();
        void FramePainted();
        bool IsIrqLine();
        void SetIrqLine();

        byte VeraReadIO(byte reg);
        void VeraWriteIO(byte reg, byte value);
        void Init(IVideoAccess videoAccesss);
    }
}
