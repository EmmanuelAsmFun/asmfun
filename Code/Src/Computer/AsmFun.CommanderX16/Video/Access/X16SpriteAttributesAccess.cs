﻿#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.CommanderX16.Video.Data;
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using System;
using System.Linq;

namespace AsmFun.CommanderX16.Video
{
    public class X16SpriteAttributesAccess : ISpriteAttributesAccess, ISpriteAccess
    {

        public int NumberOfTotalSprites => NumberOfSprites;
        private int NumberOfSprites;
        private uint spriteDataStartAddress;
        private X16VideoSpriteProperties[] sprite_properties;

        private byte[] sprite_line_col;
        private byte[] sprite_line_z;

        public bool sprite_line_empty;
        private byte[][] spriteData;
        private byte[] spriteDataRaw;
        private readonly VideoSettings videoSettings;
        private readonly ISpriteRegistersAccess spriteRegisters;
        private readonly IVideoPaletteAccess palette;
        private IDisplayComposer displayComposer;
        private readonly IVideoRamAccess ramAccess;
        IComputerDisplay display;

        

        public string Name => "SpriteAttributes";

        public X16SpriteAttributesAccess(VideoSettings videoSettings,  IVideoRamAccess ramAccess, ISpriteRegistersAccess spriteRegisters,
            IVideoPaletteAccess videoPaletteAccess
            )
        {
            this.videoSettings = videoSettings;
            this.spriteRegisters = spriteRegisters;
            this.palette = videoPaletteAccess;
            
            NumberOfSprites = videoSettings.NumberOfSprites;    // = 128
            sprite_line_col = new byte[videoSettings.Width];
            sprite_line_z = new byte[videoSettings.Width];
            this.ramAccess = ramAccess;
            UpdateAddresses();
            sprite_properties = new X16VideoSpriteProperties[128];
            for (int i = 0; i < 128; i++)
                sprite_properties[i] = new X16VideoSpriteProperties();
            
        }

        public void Init(IDisplayComposer displayComposer)
        {
            this.displayComposer = displayComposer;
            
            SpriteEnabledUpdateMethod();
        }
        public void UpdateAddresses()
        {
            spriteDataStartAddress = ((X16VideoSettings)videoSettings).SpriteDataStartADD;
        }

        public void Reset()
        {
            // Init sprite registers
            // Register 0 = SPR_CTRL
            // Register 1 = SPR_COLLISION
           
            // Init sprite data
            spriteData = new byte[256][];
            for (int array1 = 0; array1 < 256; array1++)
                spriteData[array1] = new byte[8];
            spriteDataRaw = new byte[256 * 8];
            display?.InitSprites(this);
        }

       
        public void Refresh(ushort spriteIndex, byte[] newData)
        {
            var props = sprite_properties[spriteIndex];
            // Offset 0 : BIT 1 - 8 | Offset 1 : BIT 0- 3
            props.sprite_address = (uint)(newData[0] << 5 | (newData[1] & 0xf) << 13);
            // Offset 1 : BIT 7
            props.Mode = ((newData[1] >> 7) & 1) == 1 ? X16SpriteMode.Bpp8 : X16SpriteMode.Bpp4;
            // Offset 2: BIT 0  - 7 | Offset 3 : BIT 1 2
            props.X = (short)(newData[2] | (newData[3] & 3) << 8);
            // Offset 4: BIT 0  - 7 | Offset 5 : BIT 1 2
            props.Y = (short)(newData[4] | (newData[5] & 3) << 8);
            // Offset 6 : BIT 0
            props.HFlip = (newData[6] & 1) == 1;
            // Offset 6 : BIT 1
            props.VFlip = ((newData[6] >> 1) & 1) == 1;
            // Offset 6: BIT 3,2
            props.ZDepth = (byte)((newData[6] >> 2) & 3);
            // Offset 6 : BIT 4-7
            props.CollisionMask = (ushort)((newData[6] & 0x0f) >> 4);
            // Offset 7 : BIT 0-3
            props.palette_offset = (ushort)((newData[7] & 0x0f) << 4);
            // Offset 7 : BIT 4,5
            props.Width = (byte)(1 << (((newData[7] >> 4) & 3) + 3));
            // Offset 7 : BIT 6,7
            props.Height = (byte)(1 << ((newData[7] >> 6) + 3));


            // Fix up negative coordinates
            if (props.X >= 0x400 - props.Width)
                props.X |= unchecked((short)(0xff00 - 0x200));
            if (props.Y >= 0x200 - props.Height)
                props.Y |= unchecked((short)(0xff00 - 0x100));
        }

        internal X16VideoSpriteProperties GetX16Properties(int spriteIndex)
        {
            return sprite_properties[spriteIndex];
        }
      
       
        public ushort RenderLine(ushort y)
        {
            sprite_line_empty = !RenderLine(sprite_line_col, sprite_line_z, y);
            return y;
        }
        public bool RenderLine(byte[] spriteLineCol,byte[] spriteLineZ,ushort y)
        {
            if (!IsSpriteEnabled())
            {
                // sprites disabled
                //sprite_line_empty = true;
                return false;
            }
            sprite_line_empty = false;
            for (int i = 0; i < videoSettings.Width; i++)
            {
                spriteLineCol[i] = 0;
                spriteLineZ[i] = 0;
            }
            ushort sprite_budget = 800 + 1;
            for (int i = 0; i < NumberOfSprites; i++)
            {
                // one clock per lookup
                sprite_budget--;
                if (sprite_budget == 0)
                    break;

                var props = sprite_properties[i]; 

                // Sprite is disabled?
                if (props.ZDepth == 0)
                    continue;

                // Check whether this line falls within the sprite
                if (y < props.Y || y >= props.Y + props.Height)
                    continue;

                for (ushort sx = 0; sx < props.Width; sx++)
                {
                    ushort line_x = ((ushort)(props.X + sx));
                    if (line_x >= videoSettings.Width)
                        continue;

                    ushort eff_sx = sx;
                    ushort eff_sy = (ushort)(y - props.Y);

                    // flip
                    if (props.HFlip) eff_sx = (ushort)(props.Width - 1 - eff_sx);
                    if (props.VFlip) eff_sy = (ushort)(props.Height - 1 - eff_sy);

                    byte col_index = 0;
                    uint vaddr;
                    if (props.Mode == X16SpriteMode.Bpp4)
                    {
                        // 4 bpp
                        vaddr = (uint)(props.sprite_address + (eff_sy * props.Width >> 1) + (eff_sx >> 1));
                        byte byte1 = ramAccess.Read(vaddr);
                        if ((eff_sx & 1) != 0)
                            col_index = (byte)(byte1 & 0xf);
                        else
                            col_index = (byte)(byte1 >> 4);
                    }
                    else
                    {
                        // 8 bpp
                        vaddr = (uint)(props.sprite_address + eff_sy * props.Width + eff_sx);
                        col_index = ramAccess.Read(vaddr);
                    }

                    // one clock per fetched 32 bits
                    if ((vaddr & 3) == 0)
                    {
                        sprite_budget--;
                        if (sprite_budget == 0)
                            break;
                    }
                    // one clock per rendered pixel
                    sprite_budget--;
                    if (sprite_budget == 0)
                        break;

                    // palette offset
                    if (col_index > 0)
                    {
                        col_index += (byte)(props.palette_offset);
                        if (props.ZDepth > spriteLineZ[line_x])
                        {
                            spriteLineCol[line_x] = col_index;
                            spriteLineZ[line_x] = props.ZDepth;
                        }
                    }
                }
            }
            return true;
        }
        public VideoSpriteProperties GetSpriteInfo(int spriteIndex)
        {
            return sprite_properties[spriteIndex];
        }
        public byte[] ReadSpriteData(int spriteIndex)
        {
            var props = sprite_properties[spriteIndex];
            var data = new byte[props.Width*props.Height*4];
            var i = 0;
            uint vaddr;
            for (ushort y = 0; y < props.Height; y++)
            {
                for (ushort sx = 0; sx < props.Width; sx++)
                {
                    byte col_index = ReadSpriteColIndex(props, sx, y);
                    palette.WriteColorInArray(col_index, data, i *4);
                    i++;
                }
            }
            return data;
        } 
        public byte[] ReadSpriteColIndexData(int spriteIndex)
        {
            var props = sprite_properties[spriteIndex];
            var data = new byte[props.Width*props.Height];
            var i = 0;
            for (ushort y = 0; y < props.Height; y++)
            {
                for (ushort sx = 0; sx < props.Width; sx++)
                {
                    byte col_index = ReadSpriteColIndex(props, sx, y);
                    data[i] = col_index;
                    i++;
                }
            }
            return data;
        }

        private byte ReadSpriteColIndex(X16VideoSpriteProperties props, ushort x, ushort y)
        {
            ushort eff_sx = x;
            ushort eff_sy = y;

            // flip
            if (props.HFlip) eff_sx = (ushort)(props.Width - 1 - eff_sx);
            if (props.VFlip) eff_sy = (ushort)(props.Height - 1 - eff_sy);
            byte col_index;
            if (props.Mode == X16SpriteMode.Bpp4)
            {
                // 4 bpp
                var vaddr = (uint)(props.sprite_address + (eff_sy * props.Width >> 1) + (eff_sx >> 1));
                byte byte1 = ramAccess.Read(vaddr);
                if ((eff_sx & 1) != 0)
                    col_index = (byte)(byte1 & 0xf);
                else
                    col_index = (byte)(byte1 >> 4);
            }
            else
            {
                // 8 bpp
                var vaddr = (uint)(props.sprite_address + eff_sy * props.Width + eff_sx);
                col_index = ramAccess.Read(vaddr);
            }
            if (col_index > 0)
                col_index += (byte)props.palette_offset;
            return col_index;
        }

        public void RenderByColIndex(byte[] spr_col_index, byte[] spr_zindex, int[] eff_x, ushort y)
        {
            if (sprite_line_empty) return;
            for (int i = 0; i < spr_col_index.Length; ++i)
            {
                spr_col_index[i] = sprite_line_col[eff_x[i]];
                // TODO: CHECK: possible bug : is now only done when not sprite_line_empty, to check
                spr_zindex[i] = sprite_line_z[eff_x[i]];
            }
        } 
        public void RenderByColIndexNoScale(byte[] spr_col_index, byte[] spr_zindex, int x, ushort y)
        {
            if (sprite_line_empty) return;
            Array.Copy(sprite_line_col, x, spr_col_index, 0, spr_col_index.Length);
            Array.Copy(sprite_line_z, x, spr_zindex, 0, spr_col_index.Length);
        }

        public byte CalculateColIndex(byte[][] layerLine, bool[] layerLinesEmpty, int eff_x)
        {
            byte colorIndex = 0;
            byte spr_col_index = (byte)(sprite_line_empty ? 0 : sprite_line_col[eff_x]);
            byte spr_zindex = sprite_line_z[eff_x];
            byte l1_col_index = (byte)(layerLinesEmpty[0] ? 0 : layerLine[0][eff_x]);
            byte l2_col_index = (byte)(layerLinesEmpty[1] ? 0 : layerLine[1][eff_x]);
            return CalculateLineColIndex(spr_zindex, spr_col_index, l1_col_index, l2_col_index);
        }
        public byte CalculateLineColIndex(byte spr_zindex, byte spr_col_index, byte l1_col_index, byte l2_col_index)
        {
            byte colorIndex = 0;
            switch (spr_zindex)
            {
                case 3:
                    colorIndex = spr_col_index != 0 ? spr_col_index : (l2_col_index != 0 ? l2_col_index : l1_col_index);
                    break;
                case 2:
                    colorIndex = l2_col_index != 0 ? l2_col_index : (spr_col_index != 0 ? spr_col_index : l1_col_index);
                    break;
                case 1:
                    colorIndex = l2_col_index != 0 ? l2_col_index : (l1_col_index != 0 ? l1_col_index : spr_col_index);
                    break;
                case 0:
                    colorIndex = l2_col_index != 0 ? l2_col_index : l1_col_index;
                    break;
            }
            return colorIndex;
        }

        private Func<bool> IsSpriteEnabled;
        private void SpriteEnabledUpdateMethod()
        {
            // R37 or bigger
            if (videoSettings.ComputerVersionNum > 36)
                IsSpriteEnabled = () => displayComposer.SpritesEnable;
            else
                IsSpriteEnabled = () => !spriteRegisters.IsSpritesDisabled();
        }


        internal byte GetSpriteData(uint spriteIndex, uint y)
        {
            return spriteData[spriteIndex][y];
        }
       
        public byte Read(uint address)
        {
            // Receives full address
            return spriteDataRaw[address - spriteDataStartAddress];
            //var spriteIndex = (address >> 3) & 0xff;
            //var y = address & 0x7;
            //return sprite_data[spriteIndex][y];
        }

        public byte[] ReadBlock(uint address, int length)
        {
            // Receives full address
            var add = address - spriteDataStartAddress;
            var buf2 = new byte[length];
            Array.Copy(spriteDataRaw, add, buf2, 0, length);
            return buf2;
        }

        public int SpriteAddressSize = 0x7f;
        public void Write(uint address, byte value)
        {
            // Receives full address
            var add = address - spriteDataStartAddress;
            var spriteIndex = (address >> 3) & SpriteAddressSize; // 0x7f Prev R37 = 0xff;
            var datas = spriteData[spriteIndex];
            datas[address & 0x7] = value;
            spriteDataRaw[add] = value;
            Refresh((ushort)spriteIndex, datas);
        }

        public void WriteBlock(byte[] bytes, int sourceIndex, int address, int length)
        {
            // Receives full address
            var add = address - spriteDataStartAddress;
            var spriteIndex = (address >> 3) & SpriteAddressSize; // 0x7f Prev R37 = 0xff;
            var datas = spriteData[spriteIndex];
            Array.Copy(bytes, sourceIndex, datas, address & 0x7, length);
            Array.Copy(bytes, sourceIndex, spriteDataRaw, add, length);
            Refresh((ushort)spriteIndex, datas);
        }
        public void MemoryDump(byte[] data, int startInsertAddress)
        {
            Array.Copy(spriteDataRaw, 0,data, startInsertAddress, spriteDataRaw.Length);
        }

        public byte[] MemoryDump(int startAddress)
        {
            return spriteDataRaw.ToArray();
        }

        public void SetDisplay(IComputerDisplay display)
        {
            this.display = display;
            display.InitSprites(this);
        }

        public void Init()
        {
            
        }

      
    }
}
