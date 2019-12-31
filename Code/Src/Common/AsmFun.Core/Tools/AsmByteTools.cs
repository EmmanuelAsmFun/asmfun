#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.Core.Tools
{
    public static class AsmByteTools
    {
        public static bool IsBitSet(byte num, byte nPos)
        {
            return ((0x1 << nPos) & num) != 0;
        }

        public static bool InRange(this uint val, uint a, uint b)
        {
            // Determine if val lies between a and b without first asking which is larger (a or b)
            return (a <= val & val < b) | (b <= val & val < a);
        }
        public static bool InRange(this byte val, byte a, byte b)
        {
            // Determine if val lies between a and b without first asking which is larger (a or b)
            return (a <= val & val < b) | (b <= val & val < a);
        }
    }
}
