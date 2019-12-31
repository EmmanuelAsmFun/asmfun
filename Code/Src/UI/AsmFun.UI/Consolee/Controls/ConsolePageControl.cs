#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.UI.Consolee.UI;
using System;

namespace AsmFun.UI.Consolee.Controls
{
    public interface IConsolePageControl : IConsoleControl
    {
        ConsolePageUI PageUI { get; set; }
        PageControl Page { get; set; }
    }

    public class ConsolePageControl : ConsoleControl, IConsolePageControl
    {
        public ConsolePageUI PageUI { get; set; }
        public PageControl Page { get; set; }
        protected override void OnShowError(Exception ex)
        {
            PageUI.WriteError(ex.Message);
        }
    }
}
