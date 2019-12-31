#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.Computer.Common.IO
{
    public interface IKeyboardAccess
    {
        void KeyDown(char character, int keyCode);
        void KeyUp(char character, int keyCode);
        void PressText(string data);
        void SetClipBoard(string text);

        void DoScanCodeDown(int scancode);
        void DoScanCodeUp(int scancode, bool withBreak = true);
    }
}