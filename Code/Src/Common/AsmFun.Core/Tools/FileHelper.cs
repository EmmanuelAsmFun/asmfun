#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Runtime.InteropServices;

namespace AsmFun.Core.Tools
{
    public class FileHelper
    {
        public static string FixFolderForOS(string folder)
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            {
                return folder.Replace("\\", "");
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                return folder.Replace("\\", "");
            }
            return folder.Replace("/", "\\");
        }
    }
}
