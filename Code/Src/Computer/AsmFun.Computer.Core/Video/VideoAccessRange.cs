#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Video;
using System;

namespace AsmFun.Computer.Core.Video
{
    public class VideoAccessRange
    {
        private readonly IMemoryAccessable accessor;

        public int Start { get; set; }
        public int End { get; set; }
        public Func<bool, ushort, uint> ReturnOffset { get; set; }


        public VideoAccessRange(IMemoryAccessable accesseor)
        {
            ReturnOffset = (isRead, address) => address;
            accessor = accesseor;
        }


        public virtual byte ReadByte(ushort address)
        {
            var newAddress = ReturnOffset(true, address);
            return accessor.Read(newAddress);
        }

        public virtual void WriteByte(ushort address, byte value)
        {
            var newAddress = ReturnOffset(true, address);
            accessor.Write(newAddress, value);
        }

        internal void WriteBlock(byte[] bytes, int sourceIndex, int targetIndex, int length)
        {
            accessor.WriteBlock(bytes, sourceIndex, targetIndex, length);
        }
    }
}
