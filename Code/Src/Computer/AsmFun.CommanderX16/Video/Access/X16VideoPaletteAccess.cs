#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using System.Runtime.InteropServices;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using AsmFun.Computer.Common.Video.Enums;

namespace AsmFun.CommanderX16.Video
{

    public class X16VideoPaletteAccess : IVideoPaletteAccess, IDisposable
    //  : IMemoryAccessable
    {
        private IntPtr palette_p;
        private byte[] palette;
        private byte[][] paletteB;
        private ushort[] paletteS;
        private PixelColor[] colors;
        private ushort[] defaultPalette = {
            0x000, 0xfff, 0x800, 0xafe, 0xc4c, 0x0c5, 0x00a, 0xee7, 0xd85, 0x640, 0xf77, 0x333, 0x777, 0xaf6, 0x08f, 0xbbb, // 0
            0x000, 0x111, 0x222, 0x333, 0x444, 0x555, 0x666, 0x777, 0x888, 0x999, 0xaaa, 0xbbb, 0xccc, 0xddd, 0xeee, 0xfff, // 1
            0x211, 0x433, 0x644, 0x866, 0xa88, 0xc99, 0xfbb, 0x211, 0x422, 0x633, 0x844, 0xa55, 0xc66, 0xf77, 0x200, 0x411, // 2
            0x611, 0x822, 0xa22, 0xc33, 0xf33, 0x200, 0x400, 0x600, 0x800, 0xa00, 0xc00, 0xf00, 0x221, 0x443, 0x664, 0x886, // 3
            0xaa8, 0xcc9, 0xfeb, 0x211, 0x432, 0x653, 0x874, 0xa95, 0xcb6, 0xfd7, 0x210, 0x431, 0x651, 0x862, 0xa82, 0xca3, // 4
            0xfc3, 0x210, 0x430, 0x640, 0x860, 0xa80, 0xc90, 0xfb0, 0x121, 0x343, 0x564, 0x786, 0x9a8, 0xbc9, 0xdfb, 0x121, // 5
            0x342, 0x463, 0x684, 0x8a5, 0x9c6, 0xbf7, 0x120, 0x241, 0x461, 0x582, 0x6a2, 0x8c3, 0x9f3, 0x120, 0x240, 0x360, // 6
            0x480, 0x5a0, 0x6c0, 0x7f0, 0x121, 0x343, 0x465, 0x686, 0x8a8, 0x9ca, 0xbfc, 0x121, 0x242, 0x364, 0x485, 0x5a6, // 7
            0x6c8, 0x7f9, 0x020, 0x141, 0x162, 0x283, 0x2a4, 0x3c5, 0x3f6, 0x020, 0x041, 0x061, 0x082, 0x0a2, 0x0c3, 0x0f3, // 8
            0x122, 0x344, 0x466, 0x688, 0x8aa, 0x9cc, 0xbff, 0x122, 0x244, 0x366, 0x488, 0x5aa, 0x6cc, 0x7ff, 0x022, 0x144, // 9
            0x166, 0x288, 0x2aa, 0x3cc, 0x3ff, 0x022, 0x044, 0x066, 0x088, 0x0aa, 0x0cc, 0x0ff, 0x112, 0x334, 0x456, 0x668, // 10
            0x88a, 0x9ac, 0xbcf, 0x112, 0x224, 0x346, 0x458, 0x56a, 0x68c, 0x79f, 0x002, 0x114, 0x126, 0x238, 0x24a, 0x35c, // 11
            0x36f, 0x002, 0x014, 0x016, 0x028, 0x02a, 0x03c, 0x03f, 0x112, 0x334, 0x546, 0x768, 0x98a, 0xb9c, 0xdbf, 0x112, // 12
            0x324, 0x436, 0x648, 0x85a, 0x96c, 0xb7f, 0x102, 0x214, 0x416, 0x528, 0x62a, 0x83c, 0x93f, 0x102, 0x204, 0x306, // 13
            0x408, 0x50a, 0x60c, 0x70f, 0x212, 0x434, 0x646, 0x868, 0xa8a, 0xc9c, 0xfbe, 0x211, 0x423, 0x635, 0x847, 0xa59, // 14
            0xc6b, 0xf7d, 0x201, 0x413, 0x615, 0x826, 0xa28, 0xc3a, 0xf3c, 0x201, 0x403, 0x604, 0x806, 0xa08, 0xc09, 0xf0b }; // 15
        private int[] entries = new int[256];
        private bool isDirty = true;

        public string Name => "Palette";

        public X16VideoPaletteAccess(VideoSettings videoSettings)
        {
            var size = videoSettings.PaletteSize;
            palette = new byte[size];
            paletteS = new ushort[size / 2];
            colors = new PixelColor[size / 2];
            paletteB = new byte[size / 2][];
            palette_p = Marshal.AllocHGlobal(size / 2 * 3);
        }

        public void Init()
        {
            PaletteNeedsToReload();
        }
        
        public PixelColor GetAsPixel(int colorIndex)
        {
            var newColor = Get(colorIndex);
            paletteB[colorIndex] = newColor;
            colors[colorIndex] = new PixelColor(paletteB[colorIndex]);
            paletteS[colorIndex] = colors[colorIndex].GetAsShort();
            return colors[colorIndex];
        }
        public byte[] Get(int colorIndex)
        {
            var rgb = new byte[3];
            Marshal.Copy(palette_p + colorIndex * 3, rgb, 0, 3);
            return rgb;
            //return paletteB[colorIndex];
        }
       

        private void RefreshPalette(VideoOutModes out_mode, bool chroma_disable)
        {
            for (int i = 0; i < 256; ++i)
            {
                byte r;
                byte g;
                byte b;
                if (out_mode == VideoOutModes.DisabledVideo)
                {
                    // video generation off
                    // -> show blue screen
                    r = 0;
                    g = 0;
                    b = 255;
                }
                else
                {
                    ushort entry = (ushort)(palette[i * 2] | palette[i * 2 + 1] << 8);
                    r = (byte)(((entry >> 8) & 0xf) << 4 | ((entry >> 8) & 0xf));
                    g = (byte)(((entry >> 4) & 0xf) << 4 | ((entry >> 4) & 0xf));
                    b = (byte)((entry & 0xf) << 4 | (entry & 0xf));
                    if (chroma_disable)
                        r = g = b = (byte)((r + b + g) / 3);
                }

                entries[i] = (r << 16) | (g << 8) | (b);
            }
            isDirty = false;
        }
        public void RefreshIfNeeded(VideoOutModes out_mode, bool chroma_disable)
        {
            if (!isDirty) return;
            RefreshPalette(out_mode, chroma_disable);
        }
        public void PaletteNeedsToReload()
        {
            isDirty = true;
        }
        public int GetFromPalette(byte address)
        {
            return entries[address];
        }


        public void Reset()
        {
            // copy palette
            // paletes have different value types
            for (int i = 0; i < 256; i++)
            {
                var entry = defaultPalette[i];
                palette[i * 2 + 0] = (byte)(entry & 0xff);
                palette[i * 2 + 1] = (byte)(entry >> 8);
                paletteS[i] = defaultPalette[i];
                var r = (byte)(((entry >> 8) & 0xf) << 4 | ((entry >> 8) & 0xf));
                var g = (byte)(((entry >> 4) & 0xf) << 4 | ((entry >> 4) & 0xf));
                var b = (byte)((entry & 0xf) << 4 | (entry & 0xf));
                var col = new PixelColor(r, g, b);
                colors[i] = col;
                paletteB[i] = new byte[] { r, g, b };
                Marshal.Copy(paletteB[i], 0, palette_p + i * 3, 3);
            }
            var datas = new byte[256 * 3];
            //Marshal.Copy(palette_p, datas,0, datas.Length);
        }

        public void Write(uint pos, byte value)
        {
            palette[pos] = value;

            var offset = pos % 2;
            var colorIndex = (int)(pos / 2);
            var current = Get(colorIndex);
            byte[] newColor;
            switch (offset)
            {
                case 0: newColor = new byte[] { current[0], (byte)((value >> 4) * 17), (byte)((value & 0xf) * 17) }; break;
                case 1:
                default:
                    newColor = new byte[] { (byte)(value * 17), current[1], current[2] }; break;
            }
            Marshal.Copy(newColor, 0, palette_p + colorIndex * 3, 3);
            PaletteNeedsToReload();
            //paletteB[colorIndex] = newColor;
            // colors[colorIndex] = new PixelColor(newColor);
            // paletteS[colorIndex] = colors[colorIndex] .GetAsShort();
        }
        public byte Read(uint address)
        {
            return palette[address];
        }
        public byte[] ReadBlock(uint address, int length)
        {
            var buf = new byte[length];
            Array.Copy(palette, address, buf, 0, length);
            return buf;
        }
        public void WriteBlock(byte[] bytes, int sourceIndex, int targetIndex, int length)
        {
            Array.Copy(bytes, sourceIndex, palette, targetIndex, length);
        }
        public void MemoryDump(byte[] data, int startInsertAddress)
        {
            Array.Copy(palette, startInsertAddress, data, 0, palette.Length);
        }

        public byte[] MemoryDump(int startAddress)
        {
            var buf = new byte[palette.Length];
            Array.Copy(palette, 0, buf, 0, palette.Length);
            return buf;
        }

        public void Dispose()
        {
            Marshal.FreeHGlobal(palette_p);
        }

       
    }
}
