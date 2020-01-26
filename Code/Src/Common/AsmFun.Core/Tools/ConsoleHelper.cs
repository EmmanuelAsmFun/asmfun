#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;

namespace AsmFun.Core.Tools
{
    public class ConsoleHelper
    {
        public static void WriteError(Type type, Exception e, string message)
        {
            Console.ForegroundColor = ConsoleColor.Red;
            Console.BackgroundColor = ConsoleColor.Black;
            Console.WriteLine(type.Name + "." + e.Message + "\r\n"+ message+ "\r\n" + e.StackTrace);
            Console.ForegroundColor = ConsoleColor.Gray;
        }
        public static void WriteError(object t,Exception e)
        {
            WriteError(t.GetType(), e,"");
        }
        public static void WriteError<T>(Exception e)
        {
            WriteError(typeof(T), e,"");
        }  
        public static void WriteError<T>(Exception e,string message)
        {
            WriteError(typeof(T), e, message);
        }
    }
}
