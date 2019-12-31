﻿// Heavely inspired from https://github.com/commanderx16/x16-emulator

using AsmFun.Computer.Core.DataAccess.Computer;
using System;

namespace AsmFun.CommanderX16
{
    public class X16MemoryComputer : MemoryDataAccessDeffered
    {

        public X16MemoryComputer(IntPtr data, int length) : base(data, length)
        {
            Init(Read, Write);
        }



        private byte Read(int register, int bank)
        {
            switch (register)
            {
                case 0:
                    return 0; // (byte)(debugger_enabled ? 1 : 0);
                case 1:
                    return 0; // (byte)(log_video ? 1 : 0);
                case 2:
                    return 0;// (byte)(log_keyboard ? 1 : 0);
                case 3:
                    return 0; // echo_mode;
                case 4:
                    return 0; // (byte)(save_on_exit ? 1 : 0);
                case 5:
                    return 0; // record_gif;
                case 13:
                    return 10;// keymap;
                case 14:
                    return (byte)'1'; // emulator detection
                case 15:
                    return (byte)'6'; // emulator detection
            }
            var r1 = unchecked((byte)-1);
            return r1;// Convert.ToByte(-1);
        }

        private void Write(int register, int bank, byte data)
        {

            
        }
    }
}