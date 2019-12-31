#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion


using AsmFun.Computer.Common.IO;
using System.Threading.Tasks;

namespace AsmFun.Computer.Core.IO
{
    public class KeyboardAccess : IKeyboardAccess
    {
        protected string lastClipBoardText;

        public virtual void PressText(string data)
        {
            foreach (var item in data)
            {
                KeyDown(item, -1);
                Task.Delay(25).Wait();
                KeyUp(item, -1);
                Task.Delay(25).Wait();
            }
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
    }
}
