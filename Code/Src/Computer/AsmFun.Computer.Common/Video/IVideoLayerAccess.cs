#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Video.Data;

namespace AsmFun.Computer.Common.Video
{
    public interface IVideoLayerAccess : IMemoryAccessable
    {
        void Dispose();
        VideoLayerData GetLayer(byte layerIndex);
        VideoLayerData[] GetLayers();
        bool IsLayerEnabled(int layerIndex);
        uint ReadSpaceReadRange(out byte[] tile_bytes, VideoLayerData layer, ushort y);
        int CalcLayerEffX(VideoLayerData layer, int x);
        int CalcLayerEffY(VideoLayerData layer, ushort y);
        uint CalcLayerMapAddress(VideoLayerData layer, int realX, int realY);
    }
}