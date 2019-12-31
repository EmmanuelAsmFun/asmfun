#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using System.Text;

namespace AsmFun.UI.Consolee.UI
{
    public class ConsoleHelper
    {
        public static void WriteOK(string message = "OK")
        {
            Console.BackgroundColor = ConsoleColor.DarkGreen;
            Console.ForegroundColor = ConsoleColor.Black;
            Console.WriteLine(message);
            Console.BackgroundColor = ConsoleColor.Black;
            Console.ForegroundColor = ConsoleColor.DarkGray;
        }
        public static void WriteError(string message)
        {
            Console.BackgroundColor = ConsoleColor.DarkRed;
            Console.WriteLine(message);
            Console.BackgroundColor = ConsoleColor.Black;
        }

        public static void MenuLine(string text, int length = 77)
        {
            if (text.Length >= length)
                text = text.Substring(0, length);
            Console.WriteLine("│" + text + new string(' ', length - text.Length) + "│");
        }

        public static void Notify(string text, int length = 79)
        {
            Console.BackgroundColor = ConsoleColor.DarkMagenta;
            if (text.Length >= length)
                text = text.Substring(0, length);
            Console.WriteLine(text + new string(' ', length - text.Length));
            Console.BackgroundColor = ConsoleColor.Black;
        }
        public static void NotifyInline(string text)
        {
            Console.BackgroundColor = ConsoleColor.DarkMagenta;
            Console.Write(text);
            Console.BackgroundColor = ConsoleColor.Black;
        }

        public static void WriteTitle(string title)
        {
            var rest = Convert.ToInt32(Math.Ceiling((74 - title.Length) / 2d));
            Console.BackgroundColor = ConsoleColor.DarkBlue;
            Console.ForegroundColor = ConsoleColor.White;
            Console.WriteLine("┌" + new string('─', 77) + "┐");
            Console.WriteLine("│" + new string(' ', rest) + " " + title + " " + new string(' ', rest + 1) + "│");
            Console.WriteLine("└" + new string('─', 77) + "┘");
            Console.BackgroundColor = ConsoleColor.Black;
            Console.ForegroundColor = ConsoleColor.DarkGray;
        }

        public static string AskParameter(string title, string text, bool masked = false)
        {
            Console.CursorVisible = true;
            try
            {
                var pos = Console.CursorTop;
                var left = 18;
                var width = 40;
                var rest = Convert.ToInt32(Math.Ceiling((width - title.Length) / 2d));

                Console.BackgroundColor = ConsoleColor.DarkBlue;
                Console.ForegroundColor = ConsoleColor.DarkGray;
                Console.SetCursorPosition(left, pos);
                Console.WriteLine("┌" + new string('─', rest) + " " + title + " " + new string('─', rest + 1) + "┐");
                Console.SetCursorPosition(left, pos + 1);
                Console.WriteLine("│" + text + " >" + new string(' ', width - text.Length) + " " + "│");
                Console.SetCursorPosition(left, pos + 2);
                Console.WriteLine("└" + new string('─', width + 3) + "┘");
                Console.SetCursorPosition(left + text.Length + 4, pos + 1);
                if (masked)
                    return ReadLineMasked();
                return Console.ReadLine();
            }
            finally
            {
                Console.CursorVisible = false;
                Console.BackgroundColor = ConsoleColor.Black;
                Console.ForegroundColor = ConsoleColor.DarkGray;
            }
        }


        public static string ReadLineMasked(char mask = '*')
        {
            var sb = new StringBuilder();
            ConsoleKeyInfo keyInfo;
            while ((keyInfo = Console.ReadKey(true)).Key != ConsoleKey.Enter)
            {
                if (!char.IsControl(keyInfo.KeyChar))
                {
                    sb.Append(keyInfo.KeyChar);
                    Console.Write(mask);
                }
                else if (keyInfo.Key == ConsoleKey.Backspace && sb.Length > 0)
                {
                    sb.Remove(sb.Length - 1, 1);

                    if (Console.CursorLeft == 0)
                    {
                        Console.SetCursorPosition(Console.BufferWidth - 1, Console.CursorTop - 1);
                        Console.Write(' ');
                        Console.SetCursorPosition(Console.BufferWidth - 1, Console.CursorTop - 1);
                    }
                    else Console.Write("\b \b");
                }
            }
            Console.WriteLine();
            return sb.ToString();
        }

        public static void ClearConsoleLine(int start, int count)
        {
            Console.BackgroundColor = ConsoleColor.Black;
            for (int i = 0; i < count; i++)
            {
                Console.SetCursorPosition(0, start + i);
                Console.WriteLine(new string(' ', 79));
            }
            Console.SetCursorPosition(0, start);
        }

        #region Status Message Notifications
        public static void StatusOKMessage(string text, int length = 79)
        {
            var pos = Console.CursorTop;
            Console.SetCursorPosition(0, 15);
            Console.BackgroundColor = ConsoleColor.DarkGreen;
            Console.ForegroundColor = ConsoleColor.Black;
            if (text.Length >= length)
                text = text.Substring(0, length);
            Console.WriteLine("      " + text + new string(' ', length - text.Length - 6));
            Console.BackgroundColor = ConsoleColor.Black;
            Console.ForegroundColor = ConsoleColor.DarkGray;
            Console.CursorTop = pos;
        }

        public static void StatusErrorMessage(string text, int length = 79)
        {
            var pos = Console.CursorTop;
            Console.SetCursorPosition(0, 15);
            Console.BackgroundColor = ConsoleColor.DarkRed;
            Console.ForegroundColor = ConsoleColor.Black;
            if (text.Length >= length)
                text = text.Substring(0, length);
            Console.WriteLine("      " + text + new string(' ', length - text.Length - 6));
            Console.BackgroundColor = ConsoleColor.Black;
            Console.ForegroundColor = ConsoleColor.DarkGray;
            Console.CursorTop = pos;
        }
        #endregion
    }
}
