#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.IO;
using AsmFun.Computer.Core.IO;
using System;
using System.Collections.Generic;
using System.Diagnostics;
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
        private readonly IKeyboardMapping keyboardMapping;
        private char[] invalidChars = new char[] { '{', '}', '\t', '_' };
        

        public X16Keyboard(IX16PS2Access ps2, IComputerMemoryAccess memoryAccess, IKeyboardMapping keyboardMapping)
         : base(memoryAccess)
        {
            this.ps2 = ps2;
            this.keyboardMapping = keyboardMapping;
        }

       
     
        public override void SelectKeyMap(byte keymapIndex)
        {
            if (!keyboardMapping.Select(keymapIndex)) return;
            base.SelectKeyMap(keymapIndex);
            memoryAccess.WriteByte(0x9fb0 + 13, keymapIndex);
        }




        public override void KeyDown(char kk3, int theKey)
        {
            Console.Write(kk3 + " " + (int)kk3+" ");
            if (isRunningPasteMethod) return;
            HandlePressedKey(new KeyQueueItem(kk3, theKey, true));
        }
        public override void KeyUp(char kk3, int theKey)
        {
            if (isRunningPasteMethod) return;
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
        
        private void ExecuteMapping(char character)
        {
            if (invalidChars.Contains(character)) return;
            if (character == '\r') return;
            //try
            //{
                KeyMap mapping;
                if (character == 0x00) return;

            mapping = keyboardMapping.Get(character);
              

                if (mapping.Modifier1 == -1)
                {
                    if (mapping.Modifier == -1)
                    {
                        DoScanCodeDown(mapping.CharNum);
                        DoScanCodeUp(mapping.CharNum);
                    }
                    else
                    {
                        DoScanCodeDown(mapping.Modifier);
                        DoScanCodeDown(mapping.CharNum);
                        DoScanCodeUp(mapping.CharNum);
                        DoScanCodeUp(mapping.Modifier);
                    }
                }
                else
                {
                    DoScanCodeDown(mapping.Modifier1);
                    DoScanCodeDown(mapping.Modifier);
                    DoScanCodeDown(mapping.CharNum);
                    DoScanCodeUp(mapping.CharNum);
                    DoScanCodeUp(mapping.Modifier);
                    DoScanCodeUp(mapping.Modifier1);
                }
                if (character == '\n')
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
            var scancode = keyboardMapping.GetSpecialKey(keyNum);
            if (scancode > -1) return scancode;
            switch (keyNum)
            {
                case 74:case 75: case 76: case 77: case 78: case 79: case 80: case 81: case 82: case 83:     // NumPad 1 - 9
                    scancode = DoNum(kk3, isDown); break;
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
     
        #endregion
    }
}
