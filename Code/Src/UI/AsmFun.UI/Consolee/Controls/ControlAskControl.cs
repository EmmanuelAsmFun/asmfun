#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.UI.Consolee.Controls
{
    public class ControlAskControl : ConsolePageControl
    {
    }
    public class AskResponse
    {

    }
    public class AskResponse<T> : AskResponse
    {
        public T ResponseValue { get; set; }
        public bool IsWrongInput { get; set; }
    }
}
