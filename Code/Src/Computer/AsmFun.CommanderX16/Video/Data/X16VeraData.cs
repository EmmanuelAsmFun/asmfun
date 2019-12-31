#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.CommanderX16.Video.Data
{
    public class X16VeraData
    {
        public uint[] IOAddress;
        public byte[] IOIncrement;
        public bool IsIOAddressSelect;

        /// <summary>
        /// Interrupts will be generated for the interrupt sources set in VERA_IEN
        /// </summary>
        public byte Ien = 0;
        /// <summary>
        /// VERA_ISR will indicate interrupts that have occurred. Writing a 1 to a position in VERA_ISR will clear that interrupt status.
        /// </summary>
        public byte Isr = 0;
    }
}
