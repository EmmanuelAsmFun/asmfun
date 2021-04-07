#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;

namespace AsmFun.WPF.Startup
{
    public class Program
    {
        public static void Main(string[] args)
        {
            new WindowsUIFactory(args).Launch();
        }
    }
}
