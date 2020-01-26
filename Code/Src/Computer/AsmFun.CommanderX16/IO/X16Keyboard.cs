﻿#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Core.IO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AsmFun.CommanderX16.IO
{
    public class X16Keyboard: KeyboardAccess 
    {
        private int EXTENDED_FLAG = 0x100;
        private bool isRunningPasteMethod = false;
        private bool shiftIsDown = false;
        private bool ctrlIsDown = false;
        private bool altGrIsDown = false;
        private readonly IX16PS2Access ps2;

        private char[] invalidChars = new char[] { '{', '}', '\t', '_' };
        private List<KeyMap> keyMappingsAzertyBE = new List<KeyMap> { 
            // Alphabet
            new KeyMap('a', 0x15),new KeyMap('b', 0x32),new KeyMap('c', 0x21),new KeyMap('d', 0x23),
            new KeyMap('e', 0x24),new KeyMap('f', 0x2B),new KeyMap('g', 0x34),new KeyMap('h', 0x33),
            new KeyMap('i', 0x43),new KeyMap('j', 0x3B),new KeyMap('k', 0x42),new KeyMap('l', 0x4B),
            new KeyMap('m', 0x4C),new KeyMap('n', 0x31),new KeyMap('o', 0x44),new KeyMap('p', 0x4D),
            new KeyMap('q', 0x1C),new KeyMap('r', 0x2D),new KeyMap('s', 0x1B),new KeyMap('t', 0x2C),
            new KeyMap('u', 0x3C),new KeyMap('v', 0x2A),new KeyMap('w', 0x1A),new KeyMap('x', 0x22),
            new KeyMap('y', 0x35),new KeyMap('z', 0x5B),
            // Numbers
            new KeyMap('0',0x59,0x45),new KeyMap('1',0x59,0x16),new KeyMap('2',0x59,0x1E),new KeyMap('3',0x59,0x26),
            new KeyMap('4',0x59,0x25),new KeyMap('5',0x59,0x2E),new KeyMap('6',0x59,0x36),new KeyMap('7',0x59,0x3D),
            new KeyMap('8',0x59,0x3E),new KeyMap('9',0x59,0x46),
            // Symbols
            new KeyMap(' ', 0x29), new KeyMap(',', 58),new KeyMap('.', 0x59, 0x71),new KeyMap(':', 0x49),new KeyMap(';', 0x41),
            new KeyMap('+', 0x59, 0x4A),new KeyMap('-', 0x55),
            new KeyMap('%', 0x59, 0x52),new KeyMap('£', 0x59, 0x5D),
            new KeyMap('$', 0x5B), new KeyMap('&', 0x16), new KeyMap('!', 0x36),new KeyMap('*', 0x59, 0x5B),
            new KeyMap('=', 0x4A), new KeyMap('?', 0x59, 0x3A),
            new KeyMap('<', 0x61),new KeyMap('>', 0x59, 0x61),
            new KeyMap('(', 0x2E), new KeyMap(')', 0x4E),new KeyMap('/', 0x3B, 0x8C), // must be 59 140 on querty
            // Quotes
            new KeyMap('"',0x33, 0x24), new KeyMap('\'',0x25),
            // Alt Gr
            new KeyMap('[', 0x111, 0x14,0x54),new KeyMap(']', 0x111, 0x14,0x5B),
            new KeyMap('@', 0X111, 0x14,0x1E),new KeyMap('#', 0X111, 0x14,0x26),
            // Specials
            new KeyMap('\n', 0x5A),
                };
       
        

        public X16Keyboard(IX16PS2Access ps2)
        {
            this.ps2 = ps2;
        }

        public override void KeyDown(char kk3, int theKey)
        {
            if (kk3 == '"' && theKey == 37)
            {
                kk3 = '3';
                theKey = 51;
            }
            Console.Write(kk3 + " " + (int)kk3+" ");
            if (isRunningPasteMethod) return;
            HandlePressedKey(new KeyQueueItem(kk3, theKey, true));
        }
        public override void KeyUp(char kk3, int theKey)
        {
            if (isRunningPasteMethod) return;
            if (kk3 == '"' && theKey == 37)
            {
                kk3 = '3';
                theKey = 51;
            }
            HandlePressedKey(new KeyQueueItem(kk3, theKey, false));
        }

        public override void PressText(string data)
        {
            if (string.IsNullOrWhiteSpace(data)) return;
            foreach (var item in data)
            {
                var code = -1;
                var num = 0;
                if (int.TryParse(item.ToString(), out num))
                    code = num + 74;
                HandlePressedKey(new KeyQueueItem(item, code, true));
                Task.Delay(30).Wait();
                HandlePressedKey(new KeyQueueItem(item, code, false));
                Task.Delay(30).Wait();
            }
        }
        
        private void ExecuteMapping(char item)
        {
            if (invalidChars.Contains(item)) return;
            if (item == '\r') return;
            //try
            //{
                KeyMap mapping;
                if (item == 0x00) return;

                mapping = keyMappingsAzertyBE.FirstOrDefault(m => m.Source == item);
              

                if (mapping.Modifier1 == -1)
                {
                    if (mapping.Modifier == -1)
                    {
                        DoScanCodeDown(mapping.TheChar);
                        DoScanCodeUp(mapping.TheChar);
                    }
                    else
                    {
                        DoScanCodeDown(mapping.Modifier);
                        DoScanCodeDown(mapping.TheChar);
                        DoScanCodeUp(mapping.TheChar);
                        DoScanCodeUp(mapping.Modifier);
                    }
                }
                else
                {
                    DoScanCodeDown(mapping.Modifier1);
                    DoScanCodeDown(mapping.Modifier);
                    DoScanCodeDown(mapping.TheChar);
                    DoScanCodeUp(mapping.TheChar);
                    DoScanCodeUp(mapping.Modifier);
                    DoScanCodeUp(mapping.Modifier1);
                }
                if (item == '\n')
            {
                //MappingDown('\n');
                //MappingUp('\n');
            }
            //}
            //catch (Exception e)
            //{
            //    ConsoleHelper.WriteError<X16Keyboard>(e);
            //}
        }

      

        private void HandlePressedKey(KeyQueueItem toWorkOn)
        {
            var scancode = InterpretSpecialKey(toWorkOn.TheKey, toWorkOn.KeyCode, toWorkOn.IsDown);
            if (toWorkOn.IsDown)
            {
                if (scancode >= 0)
                    DoScanCodeDown(scancode);
                else if (scancode == -1)
                    MappingDown(toWorkOn.TheKey);
            }
            else
            {
                if (scancode >= 0)
                    DoScanCodeUp(scancode);
                else if (scancode == -1)
                    MappingUp(toWorkOn.TheKey);
            }
        }

        private void MappingDown(char key)
        {
            var mapping = keyMappingsAzertyBE.FirstOrDefault(m => m.Source == key);
            DoScanCodeDown(mapping.TheChar);
        }        
        private void MappingUp(char key)
        {
            var mapping = keyMappingsAzertyBE.FirstOrDefault(m => m.Source == key);
            DoScanCodeUp(mapping.TheChar);
        }


        public override void DoScanCodeDown(int scancode)
        {
           // var isExt = false;
            if ((scancode & EXTENDED_FLAG) > 0)
            {
                //isExt = true;
                SendToKeyboard(0xe0);
            }
            //Console.WriteLine($"KeyDown:{scancode.ToString("X2")}:{isExt}");
            //Console.WriteLine($"KeyDown:{kk3}:{scancode.ToString("X2")}:{isExt}");
            SendToKeyboard((byte)(scancode & 0xff));
        }



        public override void DoScanCodeUp(int scancode, bool withBreak=true)
        { 
            //var isExt = false;
            if ((scancode & EXTENDED_FLAG) > 0)
            {
                //isExt = true;
                SendToKeyboard(0xe0);
            }
             //Console.WriteLine($"KeyUp:{scancode.ToString("X2")}:{isExt}");
            // Console.WriteLine($"KeyUp:{kk3}:{scancode.ToString("X2")}:{isExt}");
            if (withBreak)
                SendToKeyboard(0xf0); // BREAK
            SendToKeyboard((byte)(scancode & 0xff));

        }

        private void SendToKeyboard(byte scancode)
        {
            ps2.KeyPressed(scancode);
        }

        private int InterpretSpecialKey(Char kk3, int theKey, bool isDown)
        {
            //if (isRunningPasteMethod) return -2;
            if (ctrlIsDown)
            {
                //Console.Write("C " + theKey.ToString("X2")+",");
                // CTRL V
                if (theKey == 0x41) //'v' = 02A, wirth ctrl its 0x41
                {
                    // send a keyUp for CTRL
                    DoScanCodeUp(0x14);
                    RunPasteMethod();
                    return -2;
                }
            }
            var keyNum = (byte)theKey;
            var scancode = -1;
            switch (keyNum)
            {
                case 2: scancode = 0x66; break;     // Backspace
                case 6: scancode = 0x5A; break;     // ENTER
                case 18: scancode = 0x29; break;     // SPACE
                case 24: scancode = 0x175; break;     // UP
                case 26: scancode = 0x172; break;     // DOWN
                case 23: scancode = 0x16B; break;     // LEFT
                case 25: scancode = 0x174; break;     // RIGHT
                
                case 74:case 75: case 76: case 77: case 78: case 79: case 80: case 81: case 82: case 83:     // NumPad 1 - 9
                    scancode = DoNum(kk3, isDown); break;
                case 90: scancode = 0x3A; break;     // F1
                case 91: scancode = 0x3B; break;     // F2
                case 92: scancode = 0x3C; break;     // F3
                case 93: scancode = 0x3D; break;     // F4
                case 94: scancode = 0x3E; break;     // F5
                case 95: scancode = 0x3F; break;     // F6
                case 96: scancode = 0x40; break;     // F7
                case 97: scancode = 0x41; break;     // F8
                case 98: scancode = 0x42; break;     // F9
                case 99: scancode = 0x43; break;     // F10
                case 100: scancode = 0x44; break;     // F11
                case 101: scancode = 0x45; break;     // F12
                case 119: scancode = 0x114; ctrlIsDown = isDown; break;     // RCTRL
                case 117: scancode = 89; shiftIsDown = isDown; break;   // RSHIFT
                case 116: scancode = 0x12; shiftIsDown = isDown; break;     // LSHIFT
                case 118: scancode = 0x14; ctrlIsDown = isDown; break;     // LCTRL
                case 121:
                    // 0x14, 0xE0, 0x11 ---- ~0xF0, 0x14, 0xE0,~0xF0, 0x11,
                    if (isDown)
                    {
                        DoScanCodeDown(0xE0);
                        scancode = 0x11;
                    }
                    else
                    {
                        DoScanCodeUp(0x14,false);
                        DoScanCodeUp(0xE0);
                        scancode = 0x11;
                    }
                    altGrIsDown = isDown; break;    
                    // Second byte for 'AltGr' key
                case 156:
                    scancode = 0x11; break;     // LALT
            }
            
            return scancode;
        }
        private int DoNum(char key,bool isDown)
        {
            var mapping = keyMappingsAzertyBE.FirstOrDefault(m => m.Source == key);
            // 0x59 , 0x16
            if (isDown)
            {
                DoScanCodeDown(mapping.Modifier);
                return mapping.TheChar;
            }
            else
            {
                //DoScanCodeUp(mapping.TheChar, false);
                return mapping.Modifier;
            }
        }


        
        private void RunPasteMethod()
        {
            isRunningPasteMethod = true;
            Task.Run(() =>
            {
                Task.Delay(10).Wait();
                PressText(lastClipBoardText);
                isRunningPasteMethod = false;
            });
        }



        #region Structs

        private struct KeyQueueItem
        {
            public KeyQueueItem(char theKey, int keyCode, bool isDown)
            {
                TheKey = theKey;
                KeyCode = keyCode;
                IsDown = isDown;
            }

            public char TheKey { get; set; }
            public int KeyCode { get; set; }
            public bool IsDown { get; set; }
        }
        private struct KeyMap
        {
            public char Source { get; set; }
            public int TheChar { get; set; }
            public int Modifier { get; set; }
            public int Modifier1 { get; set; }
            public KeyMap(char source, int theChar)
            {
                Source = source;
                TheChar = theChar;
                Modifier = -1;
                Modifier1 = -1;
            }
            public KeyMap(char source, int modifier, int theChar)
            {
                Source = source;
                TheChar = theChar;
                Modifier = modifier;
                Modifier1 = -1;
            }
            public KeyMap(char source, int modifier1, int modifier, int theChar)
            {
                Source = source;
                TheChar = theChar;
                Modifier = modifier;
                Modifier1 = modifier1;
            }
        } 
        #endregion
    }
}
