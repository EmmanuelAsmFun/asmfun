#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;

namespace AsmFun.CommanderX16.Video
{
    public class X16VideoMapTileAccess : IX16VideoMapTileAccess
    {
        private readonly int videoRamSize;
        private readonly int numberOfLayers;
        private readonly IVideoAccess videoAccess;
        private readonly ISpriteAttributesAccess spriteManager;
        /// <summary>
        /// Tile cache
        /// </summary>
        private VideoMapTile[] tiles;

        public X16VideoMapTileAccess(VideoSettings videoSettings, IVideoAccess videoAccess, ISpriteAttributesAccess spriteManager)
        {
            this.videoRamSize = videoSettings.VideoRAMSize;
            this.numberOfLayers = videoSettings.NumberOfLayers;
            this.videoAccess = videoAccess;
            this.spriteManager = spriteManager;

        }

        public void Reset()
        {
            tiles = new VideoMapTile[videoRamSize];
        }

        public VideoMapTile GetTile(uint mapAddress, VideoLayerData layer, bool forceReload = false,byte[] tile_bytesLinePreloaded = null)
        {
            if (mapAddress > tiles.Length) return null;
            var tile = tiles[mapAddress];
            if (!forceReload && tile != null)
                return tile;
            if (tile == null)
            {
                tile = new VideoMapTile();
                tiles[mapAddress] = tile;
            }
            tile.Layer = layer;
            // Get Map info.
            if (layer.BitmapMode)
            {
                tile.TileIndex = 0;
                tile.PaletteOffset = layer.PaletteOffset;
            }
            else
            {
                uint offset = 0;
                byte[] datas;
                if (tile_bytesLinePreloaded == null)
                    datas = videoAccess.ReadBlock(mapAddress, 2);
                else
                {
                    offset = mapAddress;
                    datas = tile_bytesLinePreloaded;
                }
                if (datas.Length > 1)
                {
                    //var datas = spriteManager.ReadBlock(mapAddress & 0xf, 2);
                    if (offset >= datas.Length)
                        offset = 0;
                    byte byte0 = 0;
                    byte byte1 = 0;
                    if (datas.Length> 0)
                    {
                        byte0 = datas[offset];
                        byte1 = datas[offset + 1];
                    }
                        if (layer.TextMode)
                    {
                        tile.TileIndex = byte0;

                        if (layer.Mode == 0)
                        {
                            tile.ForegroundColor = (byte)(byte1 & 15);
                            tile.BackgroundColor = (byte)(byte1 >> 4);
                        }
                        else
                        {
                            tile.ForegroundColor = byte1;
                            tile.BackgroundColor = 0;
                        }
                        tile.PaletteOffset = 0;
                    }
                    else if (layer.TileMode)
                    {
                        tile.ForegroundColor = 0;
                        tile.BackgroundColor = 0;
                        tile.TileIndex = (ushort)(byte0 | ((byte1 & 3) << 8));

                        // Tile Flipping
                        tile.VerticalFlip = ((byte1 >> 3) & 1) != 0;
                        tile.HorizontalFlip = ((byte1 >> 2) & 1) != 0;
                        tile.PaletteOffset = (byte)(byte1 >> 4);
                    }
                }
            }
            return tile;
        }

        public void MemoryChanged(uint adddress, byte value)
        {
            var sec = adddress % 2 == 0;
            var mapAddress = !sec ? adddress - 1 : adddress;
            if (tiles[mapAddress] == null) return;
            GetTile(mapAddress, tiles[mapAddress].Layer, true);
        }
    }
}
 