using System;
using System.Collections.Generic;
using System.Text;

namespace AsmFun.CommanderX16.IO
{
    public class X16Encoding
    {
		static int[] lengths = new int[]  {
				1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
				0, 0, 0, 0, 0, 0, 0, 0, 2, 2, 2, 2, 3, 3, 4, 0
			};
		static int[] masks = new[] { 0x00, 0x7f, 0x1f, 0x0f, 0x07 };
		static int[] mins = new[] { 4194304, 0, 128, 2048, 65536 };
		static int[] shiftc = new[]{ 0, 18, 12, 6, 0 };
		static int[] shifte = new []{ 0, 6, 4, 2, 0 };


		public static int Utf8DecodeChar(byte[] s, ref uint c, ref int e)
		{
			int len = lengths[s[0] >> 3];

			/* Assume a four-byte character and load four bytes. Unused bits are
			 * shifted out.
			 */
			c = (uint)((uint)(s[0] & masks[len]) << 18);
			c |= (uint)(s[1] & 0x3f) << 12;
			c |= (uint)(s[2] & 0x3f) << 6;
			c |= (uint)(s[3] & 0x3f) << 0;
			c >>= shiftc[len];

			/* Accumulate the various error conditions. */
			e = (c < mins[len]) ? 1 : 0 << 6; // non-canonical encoding
			e |= ((c >> 11) == 0x1b) ? 1 : 0 << 7; // surrogate half?
			e |= (c > 0x10FFFF) ? 1 : 0 << 8; // out of range?
			e |= (s[1] & 0xc0) >> 2;
			e |= (s[2] & 0xc0) >> 4;
			e |= (s[3]) >> 6;
			e ^= 0x2a; // top two bits of each tail byte correct?
			e >>= shifte[len];

			//return next;
			return 0;
		}


		public static byte Iso8859_15_FromUnicode(uint c)
		{
			// line feed -> carriage return
			if (c == '\n')
			{
				return (byte)'\r';
			}

			// translate Unicode characters not part of Latin-1 but part of Latin-15
			switch (c)
			{
				case 0x20ac: // '€'
					return 0xa4;
				case 0x160: // 'Š'
					return 0xa6;
				case 0x161: // 'š'
					return 0xa8;
				case 0x17d: // 'Ž'
					return 0xb4;
				case 0x17e: // 'ž'
					return 0xb8;
				case 0x152: // 'Œ'
					return 0xbc;
				case 0x153: // 'œ'
					return 0xbd;
				case 0x178: // 'Ÿ'
					return 0xbe;
			}

			// remove Unicode characters part of Latin-1 but not part of Latin-15
			switch (c)
			{
				case 0xa4: // '¤'
				case 0xa6: // '¦'
				case 0xa8: // '¨'
				case 0xb4: // '´'
				case 0xb8: // '¸'
				case 0xbc: // '¼'
				case 0xbd: // '½'
				case 0xbe: // '¾'
					return (byte)'?';
			}

			// all other Unicode characters are also unsupported
			if (c >= 256)
			{
				return (byte)'?';
			}

			// everything else is Latin-15 already
			return (byte)c;
		}

	}
}
