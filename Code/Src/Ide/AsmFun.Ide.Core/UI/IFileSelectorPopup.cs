#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using System.Threading.Tasks;

namespace AsmFun.Common.UI
{
    public interface IFileSelectorPopup
    {
        void Open(Action<string> folderSelected);
    }
}
