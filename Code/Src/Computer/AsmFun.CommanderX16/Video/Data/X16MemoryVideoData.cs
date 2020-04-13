#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.CommanderX16.Video;
using AsmFun.Computer.Core.DataAccess.Computer;
using System;

namespace AsmFun.CommanderX16.Video.Data
{
    public class X16MemoryVideoData : MemoryDataAccessDeffered
    {
        IX16IOAccess ioAccess;

        public X16MemoryVideoData(IntPtr data, int length) : base(data, length)
        {
        }
        public void Init(IX16IOAccess video)
        {
            ioAccess = video;
            Init(Read, Write);
        }



        private byte Read(int register, int bank)
        {
            return ioAccess.VeraReadIO((byte)register);
        }

        private void Write(int register, int bank, byte data)
        {
            ioAccess.VeraWriteIO((byte)register, data);
        }
    }
}
