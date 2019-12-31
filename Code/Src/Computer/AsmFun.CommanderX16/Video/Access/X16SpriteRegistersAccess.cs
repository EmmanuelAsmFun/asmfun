#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Video;
using System;
using System.Linq;

namespace AsmFun.CommanderX16.Video
{

    public class X16SpriteRegistersAccess : ISpriteRegistersAccess
    {
        
        private byte[] reg_sprites;
        
        public string Name => "SpriteRegisters";

        public X16SpriteRegistersAccess()
        {
           
        }
        public void Init()
        {
        }
        public void Reset()
        {
            reg_sprites = new byte[16]; 
        }
        public bool IsSpritesDisabled()
        {
            return (reg_sprites[0] & 1) == 0;
        }

        public byte Read(uint address)
        {
            return reg_sprites[address & 0xf];
        }

        public byte[] ReadBlock(uint address, int length)
        {
            var buf = new byte[length];
            Array.Copy(reg_sprites, address & 0xf, buf, 0, length);
            return buf;
        }

        public void Write(uint address, byte value)
        {
            reg_sprites[address & 0xf] = value;
            return;
        }

        public void WriteBlock(byte[] bytes, int sourceIndex, int targetIndex, int length)
        {
            Array.Copy(bytes, sourceIndex, reg_sprites, targetIndex, length);
        }
        public void MemoryDump(byte[] data, int startInsertAddress)
        {
            Array.Copy(reg_sprites, 0, data, startInsertAddress, reg_sprites.Length);
        }

        public byte[] MemoryDump(int startAddress)
        {
            return reg_sprites.ToArray();
        }
    }
}
