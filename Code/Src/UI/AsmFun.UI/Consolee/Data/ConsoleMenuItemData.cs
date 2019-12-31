#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;

namespace AsmFun.UI.Consolee.Data
{
    public interface IConsoleMenuItemData
    {
        Action Action { get; set; }
        string Id { get; set; }
        bool IsSelected { get; set; }
        bool IsActivated { get; set; }
        bool IsSelectable { get; set; }
        string Description { get; set; }
    }
    public class ConsoleMenuItemData : IConsoleMenuItemData
    {
        public Action Action{ get; set; }
        public bool IsSelected { get; set; }
        public bool IsActivated { get; set; }
        public string Id { get; set; }

        public string Title { get; set; }


        public bool IsSelectable { get; set; }

        public string TitleRight { get; set; }

        public string Description { get; set; }
    }

}
