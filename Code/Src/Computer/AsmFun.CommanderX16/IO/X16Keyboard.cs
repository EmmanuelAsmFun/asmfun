#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.IO;
using AsmFun.Computer.Common.Memory;
using AsmFun.Computer.Core.IO;
using System;
using System.Collections.Generic;

using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AsmFun.CommanderX16.IO
{
    public class X16Keyboard: KeyboardAccess 
    {
        private ushort NDX = 0x00A00A;
        private ushort KEYD = 0x00A000;

        private int EXTENDED_FLAG = 0x100;
        private bool isRunningPasteMethod = false;
        private bool shiftIsDown = false;
        private bool ctrlIsDown = false;
        private bool altGrIsDown = false;
        private readonly IX16PS2Access ps2;
        private readonly IKeyboardMapping keyboardMapping;
        private char[] invalidChars = new char[] { '{', '}', '\t', '_' };
        private byte[] pasteText;
        private bool isPasting = false;
        private int lastPasteOffset;
        

        public X16Keyboard(IX16PS2Access ps2, IComputerMemoryAccess memoryAccess, IKeyboardMapping keyboardMapping, ISymbolsDA symbolsDA)
         : base(memoryAccess)
        {
            this.ps2 = ps2;
            this.keyboardMapping = keyboardMapping;
            var ndx = symbolsDA.GetAsShort(nameof(NDX));
            if (ndx != 0) NDX = ndx;
            var keyd = symbolsDA.GetAsShort(nameof(KEYD));
            if (keyd != 0) KEYD = keyd;
        }

        public override void Step()
        {
            if (!isPasting)
                return;
            var ndx = memoryAccess.ReadByte(NDX);
            var canWrite = (byte)(10 - ndx);
            if (canWrite == 0) return;
            var address = KEYD;
            var toWrite = pasteText.Length - lastPasteOffset;
            if (toWrite == 0) {
                return;
            }
            if (toWrite > canWrite)
                toWrite = canWrite;
            memoryAccess.WriteBlock(pasteText, lastPasteOffset, address+ ndx, toWrite);
            ndx += (byte)toWrite;
            memoryAccess.WriteByte(NDX, ndx);
            lastPasteOffset += toWrite;
            //ndx = memoryAccess.ReadByte(NDX);
            //var bytes = memoryAccess.ReadBlock(address, 16);
            //Console.WriteLine("EndPAste NDX={0} |bytes={1}" ,ndx, string.Join(',', bytes));
            if (lastPasteOffset >= pasteText.Length)
            {
                isPasting = false;
                var thread = System.Threading.Thread.CurrentThread;
                Task.Run(() =>
                {
                    // we need to press the 'V' key to terminate...strange?!
                    Task.Delay(200).Wait();
                    DoScanCodeDown(0x2A);
                    Task.Delay(50).Wait();
                    DoScanCodeUp(0x2A); 
                    // backspace ... remove V
                    Task.Delay(200).Wait();
                    DoScanCodeDown(0x66);
                    Task.Delay(50).Wait();
                    DoScanCodeUp(0x66);
                });
            }
        }


        public override void PressText(string data)
        {
            //Console.BackgroundColor = ConsoleColor.Black;
            //Console.ForegroundColor = ConsoleColor.Gray;
            //Console.WriteLine();
            //Console.WriteLine();
            //Console.WriteLine("Paste Text=" + data);
            if (string.IsNullOrWhiteSpace(data)) return;
            pasteText = Encoding.UTF8.GetBytes(data);
            for (int i = 0; i < pasteText.Length; i++)
                pasteText[i] = X16Encoding.Iso8859_15_FromUnicode(pasteText[i]);
            lastPasteOffset = 0;
            isPasting = true;
           
        }



        public override void SelectKeyMap(byte keymapIndex)
        {
            if (!keyboardMapping.Select(keymapIndex)) return;
            base.SelectKeyMap(keymapIndex);
            memoryAccess.WriteByte(0x9fb0 + 13, keymapIndex);
        }
        
        public override void KeyDown(char kk3, int theKey)
        {
            var hex = theKey.ToString("X2");
            //Console.Write($"KeyDown ={kk3} (0x{hex}) {(int)kk3} |");
            HandlePressedKey(new KeyQueueItem(kk3, theKey, true));
        }
        public override void KeyUp(char kk3, int theKey)
        {
            var hex = theKey.ToString("X2");
            //Console.Write($"KeyUp ={kk3} (0x{hex}) {(int)kk3} |");
            HandlePressedKey(new KeyQueueItem(kk3, theKey, false));
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
            var mapping = keyboardMapping.Get(key);
            DoScanCodeDown(mapping.CharNum);
        }        
        private void MappingUp(char key)
        {
            var mapping = keyboardMapping.Get(key);
            DoScanCodeUp(mapping.CharNum);
        }


        public override void DoScanCodeDown(int scancode)
        {
           // var isExt = false;
            if ((scancode & EXTENDED_FLAG) > 0)
            {
                //isExt = true;
                SendToKeyboard(0xe0);
            }
            //Console.WriteLine($"KeyDown:{scancode.ToString("X2")}");
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
            // Console.WriteLine($"KeyUp:{scancode.ToString("X2")}");
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
                if (theKey == 0x41 && isDown) //'v' = 02A, wirth ctrl its 0x41
                {
                    // send a keyUp for CTRL
                    
                    RunPasteMethod();
                    //DoScanCodeUp(0x2A);
                    return -2;
                }
            }
            var keyNum = (byte)theKey;
            var scancode = keyboardMapping.GetSpecialKey(keyNum);
            if (scancode > -1) return scancode;
            switch (keyNum)
            {
                case 74:case 75: case 76: case 77: case 78: case 79: case 80: case 81: case 82: case 83:     // NumPad 1 - 9
                    scancode = DoNum(kk3, isDown); break;
                case 119: scancode = 0x114; 
                    ctrlIsDown = isDown; break;     // RCTRL
                case 117: scancode = 89; shiftIsDown = isDown; break;   // RSHIFT
                case 116: scancode = 0x12; shiftIsDown = isDown; break;     // LSHIFT
                case 118: scancode = 0x14;
                    ctrlIsDown = isDown; break;     // LCTRL
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
            var mapping = keyboardMapping.Get(key);
            // 0x59 , 0x16
            if (isDown)
            {
                DoScanCodeDown(mapping.Modifier);
                return mapping.CharNum;
            }
            else
            {
                //DoScanCodeUp(mapping.TheChar, false);
                return mapping.Modifier;
            }
        }


        
        private void RunPasteMethod()
        {
            if (isRunningPasteMethod) return;
            isRunningPasteMethod = true;
            PressText(lastClipBoardText);
            isRunningPasteMethod = false;
            //isRunningPasteMethod = true;
            //Task.Run(() =>
            //{

            //    Task.Delay(100).Wait();
            //    PressText(lastClipBoardText);
            //    Task.Delay(1000).Wait();
            //    isRunningPasteMethod = false;
            //});
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
     
        #endregion
    }
}
