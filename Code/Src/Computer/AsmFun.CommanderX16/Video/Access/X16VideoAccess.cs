#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Data;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;

namespace AsmFun.CommanderX16.Video
{

    /// <summary>
    /// The manager video access
    /// </summary>
    public class X16VideoAccess : IVideoAccess
    {
        private IVideoPainter videoPainter;
        private readonly IAccessorContainer accessorContainer;
        private IX16VideoMapTileAccess mapTileAccess;
        private X16IOAccess ioAccess;



        public X16VideoAccess( IAccessorContainer accessorContainer)
        {
            this.accessorContainer = accessorContainer;
            
        }
        public void Init(X16IOAccess ioAccess, IVideoPainter videoPainter, IX16VideoMapTileAccess mapTileAccess)
        {
            this.videoPainter = videoPainter;
            this.mapTileAccess = mapTileAccess;
            this.ioAccess = ioAccess;
            accessorContainer.Init();
        }

        public void Reset()
        {
            ioAccess.Reset();
            mapTileAccess.Reset();
            accessorContainer.Reset();
            videoPainter.Reset();
        }

        public void ProcessorStep()
        {
            videoPainter.ProcessorStep();
        }
        public void Step()
        {
            videoPainter.Step();
        }

        public bool GetIrqOut()
        {
            return ioAccess.GetIrqOut();
        }

        public byte Read(uint address)
        {
            return accessorContainer.Read(address);
        }

        public byte[] ReadBlock(uint address, int length)
        {
            return accessorContainer.ReadBlock(address, length);
        }

        public void Write(uint address, byte value)
        {
            accessorContainer.Write(address, value);
        }

        public void SetDisplay(IComputerDisplay display)
        {
            videoPainter.SetDisplay(display);
        }

        public void LockOnMhz(bool state)
        {
            videoPainter.LockOnProcessor(state);
        }  
        public void LockOnFps(bool state)
        {
            videoPainter.LockOnFps = state;
        } 
        public MemoryDumpData[] MemoryDump()
        {
            return accessorContainer.MemoryDump();
        }

        public void WriteBlock(int startAddress, byte[] data, int count)
        {
            accessorContainer.WriteBlock(startAddress, data, count);
        }
    }
}

