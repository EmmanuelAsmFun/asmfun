#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using System;
using System.IO;
using System.Runtime.InteropServices;

namespace AsmFun.Computer.Core.Video
{
    public class VideoRamAccess : IVideoRamAccess, IDisposable
    {
        private readonly int ramSize;
        private IntPtr videoRAM;

        public string Name => "VideoRAM";

        public VideoRamAccess(VideoSettings videoSettings)
        {
            ramSize = videoSettings.VideoRAMSize;
        }

        public virtual void Init()
        {

        }
        public virtual void Reset()
        {
            if (videoRAM != null) Marshal.FreeHGlobal(videoRAM);
            videoRAM = Marshal.AllocHGlobal(ramSize);
            for (int i = 0; i < ramSize; i++)
                Marshal.WriteByte(videoRAM + i, 0);
        }

        public virtual void Write(uint address, byte data)
        {
            if (address > ramSize) return;
            Marshal.WriteByte(videoRAM + (int)address, data);
        }

        public virtual byte Read(uint address)
        {
            if (address > ramSize) return 0;
            return Marshal.ReadByte(videoRAM + (int)address); ;
        }

        public virtual void WriteBlock(uint address, byte[] data, int startIndex, int length)
        {
            Marshal.Copy(data, startIndex, videoRAM + (int)address, length); ;
        }

        public virtual byte[] ReadBlock(uint address, int length)
        {
            var buf = new byte[length];
            Marshal.Copy(videoRAM + (int)address, buf, 0, length);
            return buf;
        }

        public virtual void WriteBlock(byte[] bytes, int sourceIndex, int targetIndex, int length)
        {
            throw new NotImplementedException();
        }

        public void MemoryDumpToFile(string fileName = @"c:\temp\RAMDump.bin")
        {
            var buf = new byte[ramSize];
            Marshal.Copy(videoRAM, buf, 0, ramSize);
            File.WriteAllBytes(@"c:\temp\RAMDump.bin",buf);
        } 
       
        public void MemoryDump(byte[] data, int startInsertAddress)
        {
            Marshal.Copy(videoRAM, data, startInsertAddress, ramSize);
        }
        public byte[] MemoryDump(int startAddress)
        {
            var buf = new byte[ramSize];
            Marshal.Copy(videoRAM, buf, 0, ramSize);
            return buf;
        }
        public void Dispose()
        {
            if (videoRAM != null)
                Marshal.FreeHGlobal(videoRAM);
        }
      
    }
}
