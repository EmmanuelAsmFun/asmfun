#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using System.Diagnostics;

namespace AsmFun.Computer.Common.Video.Data
{
    [DebuggerDisplay("Color:{R},{G},{B}")]
    public struct PixelColor : IEquatable<PixelColor>
    {
        public byte R { get; set; }
        public byte G { get; set; }
        public byte B { get; set; }

        public PixelColor(byte r, byte g, byte b)
        {
            R = r;
            G = g;
            B = b;
        }
        public PixelColor(byte[] rgb)
        {
            R = rgb[0];
            G = rgb[1];
            B = rgb[2];
        }
        public ushort GetAsShort()
        {
            return (ushort)((R << 8) / 17 + (G << 4) / 17 + B / 17);
        }
        public byte[] ToBytes()
        {
            return new[] { R, G, B };
        }

        public static bool operator ==(PixelColor first, PixelColor other)
        {
            return first.R == other.R && first.G == other.G && first.B == other.B;
        }
        public static bool operator !=(PixelColor first, PixelColor other)
        {
            return first.R != other.R || first.G != other.G || first.B != other.B;
        }

        public bool Equals(PixelColor other)
        {
            return R == other.R && G == other.G && B == other.B;
        }
    }
}
