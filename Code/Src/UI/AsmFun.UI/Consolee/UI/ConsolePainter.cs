#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using System.Text;

namespace AsmFun.UI.Consolee.UI
{
    public class ConsolePainter
    {
        public int MenuWidth { get; set; }
        public void AddTitle(StringBuilder sb, string text)
        {
            AddCenterText(sb, text);
        }

        public void DrawCentedTitle(StringBuilder sb, string text)
        {
            var length = text.Length;
            var rest = text.Length % 2;
            var charcount = (MenuWidth - length) / 2;
            //sb.Append((char)218 + new string(ConsoleCharSet.I.CharH, charcount) + text + new string(ConsoleCharSet.I.CharH, charcount + rest) + (char)191);
            sb.Append(new string(ConsoleCharSet.I.CharH, charcount) + text + new string(ConsoleCharSet.I.CharH, charcount + rest));
        }
        public void AddCenterText(StringBuilder sb, string text)
        {
            var length = text.Length;
            var rest = text.Length % 2;
            var charcount = (MenuWidth - length - 2) / 2;
            sb.Append(ConsoleCharSet.I.CharV + new string(' ', charcount) + text + new string(' ', charcount + rest) + ConsoleCharSet.I.CharV);
        }

        public void AddHorizontalLine(StringBuilder sb, bool insideMenu = false)
        {
            if (insideMenu)
                sb.Append(ConsoleCharSet.I.CharLineHLeft + new string(ConsoleCharSet.I.CharH, MenuWidth - 2) + ConsoleCharSet.I.CharLineHRight);
            else
                sb.AppendLine(new string(ConsoleCharSet.I.CharH, MenuWidth));
        }

        public void AddEmptyLine(StringBuilder sb)
        {
            sb.Append(new string(' ', MenuWidth));

        }
        public void AddMenuText(StringBuilder sb, string text)
        {
            sb.Append(ConsoleCharSet.I.CharV + text + new string(' ', MenuWidth - 2 - text.Length) + ConsoleCharSet.I.CharV);
        }
        public void AddTopLine(StringBuilder sb, int width)
        {
            sb.Append(ConsoleCharSet.I.CharTopLeft + new string(ConsoleCharSet.I.CharH, width - 2) + ConsoleCharSet.I.CharTopRight);
        }
        public void AddBottomLine(StringBuilder sb, int width)
        {
            sb.Append(ConsoleCharSet.I.CharBottomLeft + new string(ConsoleCharSet.I.CharH, width - 2) + ConsoleCharSet.I.CharBottomRight);
        }
        public void AddBorderedLine(StringBuilder sb, int width)
        {
            sb.Append(ConsoleCharSet.I.CharV + new string(' ', width - 2) + ConsoleCharSet.I.CharV);
        }

        public void EmptyLine(int lineNum, bool returnToPreviousPosition = false)
        {
            var previousposH = Console.CursorLeft;
            var previousposV = Console.CursorTop;
            Console.CursorTop = lineNum;
            Console.CursorLeft = 0;
            Console.WriteLine(new string(' ', Console.BufferWidth));
            Console.CursorTop = lineNum;
            if (returnToPreviousPosition)
            {
                Console.CursorLeft = previousposH;
                Console.CursorTop = previousposV;
            }
        }
        public void DrawBox(ConsoleStyleSheet style, string title, int x, int y, int width, int height, bool withShadow = true, bool asPopup = true)
        {
            var widthReduction = withShadow ? 1 : 0;
            if (asPopup)
                style.SetBoxBgColor();
            StringBuilder sb = new StringBuilder();
            AddTopLine(sb, width - 1);
            Console.SetCursorPosition(x, y);
            Console.Write(sb.ToString());
            sb.Clear();
            for (int i = 1; i < height - 1; i++)
            {
                if (withShadow)
                {
                    style.SetBoxShadowColor();
                    Console.SetCursorPosition(x + width - widthReduction, y + i);
                    Console.Write(' ');
                }
                if (asPopup)
                    style.SetBoxBgColor();
                AddBorderedLine(sb, width - 1);
                if (x < Console.BufferWidth && y + i < Console.WindowHeight)
                {
                    Console.SetCursorPosition(x, y + i);
                    Console.Write(sb.ToString());
                }
                else
                {
                    return;
                }
                sb.Clear();

            }
            if (withShadow)
            {
                style.SetBoxShadowColor();
                Console.SetCursorPosition(x + width - widthReduction, y + height - 1);
                Console.Write(' ');
            }
            if (asPopup)
                style.SetBoxBgColor();
            AddBottomLine(sb, width - 1);
            Console.SetCursorPosition(x, y + height - 1);
            Console.Write(sb.ToString());
            sb.Clear();
            if (withShadow)
            {
                style.SetBoxShadowColor();
                Console.SetCursorPosition(x + 1, y + height);
                Console.Write(new string(' ', width - widthReduction));
            }
            // draw title
            if (asPopup)
                style.SetBoxBgColor();
            var xoffset = (int)Math.Round((double)(width - 2 - title.Length) / 2, 0);
            Console.SetCursorPosition(x + xoffset - 1, y);
            Console.Write(' ' + title + ' ');
        }

        public void DrawText(string text)
        {
            Console.Write(text);
        }
        public void DrawText(string text, int x ,int y)
        {
            Console.SetCursorPosition(x, y);
            Console.Write(text);
        }
    }
}
