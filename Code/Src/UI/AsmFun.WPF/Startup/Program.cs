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
            Console.WriteLine("EMMANUIEL USE this: https://github.com/nwjs");
            Console.ReadLine();
            new WindowsUIFactory(args).Launch();
        }
    }
}
