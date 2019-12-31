#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Video.Data;

namespace AsmFun.CommanderX16.Video
{
    public interface IX16VideoMapTileAccess
    {
        VideoMapTile GetTile(uint mapAddress, VideoLayerData layer, bool forceReload = false, byte[] tile_bytes_preloaded = null);
        void MemoryChanged(uint adddress, byte value);
        void Reset();
    }
}