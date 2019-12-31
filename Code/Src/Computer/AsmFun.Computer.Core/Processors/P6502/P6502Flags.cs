#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.Computer.Core.Processors.P6502
{
    public class P6502Flags
    {
        public const int FLAG_CARRY = 0x01;
        public const int FLAG_ZERO = 0x02;
        public const int FLAG_INTERRUPT = 0x04;
        public const int FLAG_DECIMAL = 0x08;
        public const int FLAG_BREAK = 0x10;
        public const int FLAG_CONSTANT = 0x20;
        public const int FLAG_OVERFLOW = 0x40;
        public const int FLAG_SIGN = 0x80;
        public const int BASE_STACK = 0x100;
    }
}
