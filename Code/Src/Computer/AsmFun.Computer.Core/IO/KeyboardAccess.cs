#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion


using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.IO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AsmFun.Computer.Core.IO
{
    public class KeyboardAccess : IKeyboardAccess
    {
        protected string lastClipBoardText;
        public List<string> Keymaps = new List<string>();
        public byte KeymapIndex = 0;
        protected readonly IComputerMemoryAccess memoryAccess;

        public KeyboardAccess(IComputerMemoryAccess memoryAccess)
        {
            this.memoryAccess = memoryAccess;
        }

        public virtual void Step()
        {

        }
        public virtual void PressText(string data)
        {
           
        }

        public virtual void KeyDown(char character, int keyCode)
        {
        }

        public virtual void KeyUp(char character, int keyCode)
        {
        }

        public void SetClipBoard(string text)
        {
            lastClipBoardText = text;
        }

        public virtual void DoScanCodeDown(int scancode)
        {
        }

        public virtual void DoScanCodeUp(int scancode, bool withBreak = true)
        {
        }

        public virtual string[] GetKeyMaps()
        {
            return Keymaps.ToArray();
        }
        public virtual void SelectKeyMap(byte keymapIndex)
        {
            KeymapIndex = keymapIndex;
        }
    }
}
