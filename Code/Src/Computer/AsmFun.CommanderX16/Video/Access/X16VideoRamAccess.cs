#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Video.Data;
using AsmFun.Computer.Core.Video;

namespace AsmFun.CommanderX16.Video.Access
{
    public class X16VideoRamAccess : VideoRamAccess
    {
        private IX16VideoMapTileAccess mapTileAccess;

        public X16VideoRamAccess(VideoSettings videoSettings) : base(videoSettings)
        {
            
        }
        public void Init(IX16VideoMapTileAccess mapTileAccess)
        {
            this.mapTileAccess = mapTileAccess;
        }

        public override void Write(uint address, byte value)
        {
            base.Write(address, value);
            mapTileAccess.MemoryChanged(address, value);
        }
    }
}
