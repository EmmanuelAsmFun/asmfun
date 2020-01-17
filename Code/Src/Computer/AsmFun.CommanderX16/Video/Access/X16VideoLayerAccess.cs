#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using System;
using System.Runtime.InteropServices;

namespace AsmFun.CommanderX16.Video
{


    public class X16VideoLayerAccess : IVideoLayerAccess, IDisposable
    {
        private const int layerSize = 16;
        private int videoHeight;
        private int videoWidth;
        private VideoLayerData[] layers;
        private IntPtr layerMemory_P;
        private int layerMemorySize;
        private readonly IX16VideoMapTileAccess mapTileAccess;
        private readonly VideoSettings videoSettings;
        private readonly IComputerMemoryAccess computerMemoryAccess;
        private readonly IVideoRamAccess videoRamAccess;

        public string Name => "Layer";

        public X16VideoLayerAccess(IX16VideoMapTileAccess mapTileAccess, VideoSettings videoSettings, IComputerMemoryAccess computerMemoryAccess,
            IVideoRamAccess videoRamAccess)
        {
            this.mapTileAccess = mapTileAccess;
            this.videoSettings = videoSettings;
            this.computerMemoryAccess = computerMemoryAccess;
            this.videoRamAccess = videoRamAccess;
            layerMemorySize = layerSize * videoSettings.NumberOfLayers;
            layerMemory_P = Marshal.AllocHGlobal(layerMemorySize);
            layers = new VideoLayerData[videoSettings.NumberOfLayers];
            videoHeight = videoSettings.Height;
            videoWidth = videoSettings.Width;
        }

        public void Init()
        {
            
        }

        public void Reset()
        {
            var bytes = new byte[layerSize * videoSettings.NumberOfLayers];
            Marshal.Copy(bytes, 0, layerMemory_P, bytes.Length);
            
            for (int i = 0; i < videoSettings.NumberOfLayers; i++)
                layers[i] = new VideoLayerData(i);
        }


        private VideoLayerData ReloadLayer(byte layerIndex)
        {
            
            VideoLayerData props = layers[layerIndex];
            props.PaintRequireReload = true;
            var prev_layerw_max = props.LayerWidthMax;
            var prev_hscroll = props.HorizontalScroll;

            var layerData = new byte[layerSize];
            Marshal.Copy(layerMemory_P+ (layerIndex * layerSize), layerData, 0, layerSize);

            // X can be 2 or 3, representing Layer 0 or Layer 1, respectively, 
            // the following memory-mapped addresses control display layer behavior:

            // $0F:$X000 - Layer modes and enable flag
            // The least significant bit of $04:$00X0 is an enable bit. If set (1), the layer is drawn. 
            // If reset (0), the layer is not drawn.
            // BIT 0
            props.IsEnabled = (layerData[0] & 1) != 0;

            // The 3 most significant bits of $04:$00X0 represent the layer’s “mode” setting.
            // BIT 5,6,7
            props.Mode = (byte)(layerData[0] >> 5);

            // MAP_BASE specifies the base address where tile map data is fetched from. 
            // (Note that the registers don’t specify the lower 2 bits, so the address is always aligned to a multiple of 4 bytes.)
            props.MapBase = (uint)(layerData[2] << 2 | layerData[3] << 10);

            // TILE_BASE specifies the base address where tile data is fetched from. (Note that the registers don’t specify the 
            // lower 2 bits, so the address is always aligned to a multiple of 4 bytes.)
            props.TileBase = (uint)(layerData[4] << 2 | layerData[5] << 10);

            // Text and Tile mode settings
            // $0F:$X001 - Text and Tile format
            props.TextMode = (props.Mode == 0) || (props.Mode == 1);
            props.TileMode = (props.Mode == 2) || (props.Mode == 3) || (props.Mode == 4);
            props.BitmapMode = (props.Mode == 5) || (props.Mode == 6) || (props.Mode == 7);

            if (!props.BitmapMode)
            {
                // HSCROLL specifies the horizontal scroll offset. A value between 0 and 4095 can be used. 
                // Increasing the value will cause the picture to move left, decreasing will cause the picture to move right.
                props.HorizontalScroll = (ushort)(layerData[6] | (layerData[7] & 0xf) << 8);
                // YSCROLL specifies the vertical scroll offset. A value between 0 and 4095 can be used. 
                // Increasing the value will cause the picture to move up, decreasing will cause the picture to move down.
                props.VerticalScroll = (ushort)(layerData[8] | (layerData[9] & 0xf) << 8);
            }
            // MAPW, MAPH specify the map width and map height respectively:
            // 0 = 32 tiles, 1 = 64 tiles, 2 = 128 tiles, 3 = 256 tiles
            props.MapWidth = 0;
            props.MapHeight = 0;
            // TILEW, TILEH specify the tile width and tile height respectively:
            // 0 = 8px, 1 = 16px
            props.TileWidth = 0;
            props.TileHeight = 0;

            // $0F:$X001 contains the tilemap settings for layer X, in the format %00ABCCDD:
            if (props.TileMode || props.TextMode)
            {
                // DD : 2 bits to adjust tilemap width.
                props.MapWidth = (ushort)(1 << ((layerData[1] & 3) + 5));
                // CC: 2 bits to adjust tilemap height.
                props.MapHeight = (ushort)(1 << (((layerData[1] >> 2) & 3) + 5));
                // Scale the tiles or text characters arccording to TILEW and TILEH.
                // B: 1 bit to enable 16-pixel tile width. Ignored in text modes.
                props.TileWidth = (ushort)(1 << (((layerData[1] >> 4) & 1) + 3));
                // A: 1 bit to enable 16-pixel tile height. Ignored in text modes.
                props.TileHeight = (ushort)(1 << (((layerData[1] >> 5) & 1) + 3));
                // 0 : Unused.
            }
            else if (props.BitmapMode)
            {
                // Bitmap mode is tiled mode with a single tile
                props.TileWidth = (ushort)(((layerData[1] >> 4) & 1) != 0 ? 640 : 320);
                props.TileHeight = (ushort)videoHeight;
            }

            // We know mapw, maph, tilew, and tileh are powers of two, and any products of that set will be powers of two,
            // so there's no need to modulo against them if we have bitmasks we can bitwise-and against.

            props.MapWidthMax = (ushort)(props.MapWidth - 1);
            props.MapHeightMax = (ushort)(props.MapHeight - 1);
            props.TileWidthMax = (ushort)(props.TileWidth - 1);
            props.TileHeightMax = (ushort)(props.TileHeight - 1);

            props.LayerWidth = (ushort)(props.MapWidth * props.TileWidth);
            props.LayerHeight = (ushort)(props.MapHeight * props.TileHeight);

            props.LayerWidthMax = (ushort)(props.LayerWidth - 1);
            props.LayerHeightMax = (ushort)(props.LayerHeight - 1);


            // Find min/max eff_x for bulk reading in tile data during draw.
            if (prev_layerw_max != props.LayerWidthMax || prev_hscroll != props.HorizontalScroll)
            {
                int min_eff_x = int.MaxValue;
                int max_eff_x = int.MinValue;
                for (int x = 0; x < videoWidth; ++x)
                {
                    int eff_x = CalcLayerEffX(props, x);
                    if (eff_x < min_eff_x)
                    {
                        min_eff_x = eff_x;
                    }
                    if (eff_x > max_eff_x)
                    {
                        max_eff_x = eff_x;
                    }
                }
                props.min_eff_x = min_eff_x;
                props.max_eff_x = max_eff_x;
            }


            props.BitsPerPixel = 0;
            switch (props.Mode)
            {
                case 0:
                case 1:
                    props.BitsPerPixel = 1;
                    break;
                case 2:
                case 5:
                    props.BitsPerPixel = 2;
                    break;
                case 3:
                case 6:
                    props.BitsPerPixel = 4;
                    break;
                case 4:
                case 7:
                    props.BitsPerPixel = 8;
                    break;
            }

            props.TileSize = (uint)((props.TileWidth * props.BitsPerPixel * props.TileHeight) >> 3);
            props.PaletteOffset = (byte)(layerData[7] & 0xf);
            return props;
        }

        public int CalcLayerEffX(VideoLayerData props, int x)
        {
            return (x + props.HorizontalScroll) & (props.LayerWidthMax);
        }

        public int CalcLayerEffY(VideoLayerData layer, ushort y)
        {
            return (y + layer.VerticalScroll) & (layer.LayerHeightMax);
        }

        public uint CalcLayerMapAddress(VideoLayerData props, int eff_x, int eff_y)
        {
            if (props.TileWidth == 0 || props.TileHeight == 0) return 0;
            return (uint)(props.MapBase + (eff_y / props.TileHeight * props.MapWidth + eff_x / props.TileWidth) * 2);
        }
        
        public uint ReadSpaceReadRange(out byte[] tile_bytes, VideoLayerData layer, ushort y)
        {
            int size;
            int eff_y = CalcLayerEffY(layer, y);
            var map_addr_begin = CalcLayerMapAddress(layer, layer.min_eff_x, eff_y);
            var map_addr_end = CalcLayerMapAddress(layer, layer.max_eff_x, eff_y);
            size = (int)((map_addr_end - map_addr_begin) + 2);
            tile_bytes = videoRamAccess.ReadBlock(map_addr_begin, size);
            return map_addr_begin;
        }
      

        public VideoLayerData GetLayer(byte layerIndex)
        {
            return layers[layerIndex];
        } 
        public VideoLayerData[] GetLayers()
        {
            return layers;
        }
        public bool IsLayerEnabled(int layerIndex)
        {
            return layers[layerIndex].IsEnabled;
        }

        public byte Read(int layerIndex, uint address)
        {
            var index = (int)address + layerIndex * layerSize;
            return Marshal.ReadByte(layerMemory_P + index);
        }

        public void Write(byte layerIndex, uint address, byte value)
        {
            Marshal.WriteByte(layerMemory_P + (int)address + layerIndex * layerSize, value);
            ReloadLayer(layerIndex);
            mapTileAccess.Reset();
        }

        public byte[] ReadBlock(int layerIndex, uint address, int length)
        {
            var buf = new byte[length];
            Marshal.Copy(layerMemory_P + (int)address + layerIndex * layerSize, buf, 0, length);
            return buf;
        }


        public byte Read(uint address)
        {
            // 0x1000 is a fix to know if it's layer 0 or 1
            if (address >= 0x1000)
                return Read(1, address - 0x1000);
            return Read(0, address );
            //return Marshal.ReadByte(layerMemory_P + (int)address);
        }

        public void Write(uint address, byte value)
        {
            // 0x1000 is a fix to know if it's layer 0 or
            if (address >= 0x1000)
                Write(1, (byte)(address - 0x1000),value);
            else
                Write(0, (byte)address,value);
            return;
        }

        public byte[] ReadBlock(uint address, int length)
        {
            if (address >= 0x1000)
                address += layerSize;
            var buf = new byte[length];
            Marshal.Copy(layerMemory_P + (int)address, buf, 0, length);
            return buf;
        }

        public void WriteBlock(byte[] bytes, int startIndex, int address, int length)
        {
            byte layerIndex = 0;
            if (address >= 0x1000)
            {
                address = layerSize;
                layerIndex = 1;
            }
            Marshal.Copy(bytes, startIndex, layerMemory_P + address, length);
            ReloadLayer(layerIndex);
        }
       
        public byte[] MemoryDump(int startAddress)
        {
            var buf = new byte[layerMemorySize - layerSize];
            if (startAddress == ((X16VideoSettings)videoSettings).Layer1StartADD)
            {
                Marshal.Copy(layerMemory_P, buf, 0, layerMemorySize - layerSize);
                return buf;
            }
            Marshal.Copy(layerMemory_P + layerSize, buf, 0, layerMemorySize - layerSize);
            return buf;
        }

        public void MemoryDump(byte[] data, int startInsertAddress)
        {
            Marshal.Copy(layerMemory_P, data, startInsertAddress, layerMemorySize);
        }

        public void Dispose()
        {
            Marshal.FreeHGlobal(layerMemory_P);
        }

       
    }
}
