#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using System.Threading.Tasks;

namespace AsmFun.Ide.Core.Features.Files
{
    public interface IFileSelectorPopup
    {
        void Open(Action<string> folderSelected);
    }
}
