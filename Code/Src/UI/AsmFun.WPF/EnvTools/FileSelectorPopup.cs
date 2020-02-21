#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using AsmFun.Ide.Core.Features.Files;
using AsmFun.WPF.TheWPF;
using Microsoft.Win32;

namespace AsmFun.WPF.EnvTools
{
    public class FileSelectorPopup : IFileSelectorPopup
    {
        public static RootHiddenWindow Window;
        public void Open(Action<string> folderSelected)
        {
            Window.Dispatcher?.Invoke(() =>
            {
                var fd = new OpenFileDialog
                {
                    Title = "Select your Main assembler file.",
                    Filter = "assembler files (*.asm,*a)|*.asm;*.a"
                };
                fd.ShowDialog();
                folderSelected(fd.FileName);
            });
        }
    }

}
