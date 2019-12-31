#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.UI.Consolee.UI;
using System;
using System.Text;

namespace AsmFun.UI.Consolee.Controls
{
    public enum ConsoleCommand
    {
        Unknown,
        Back,
        Quit,
        Select,
        Redraw,
        Confirm,
        Up,
        Down,
        Left,
        Right,
        PageUp,
        PageDown
    }
    public class ConsoleCursorReader
    {
        public Func<ConsoleKeyInfo, bool> ExecuteChar { get; set; }
        public ConsolePageUI PageUI { get; set; }
        public ConsoleCommand Command { get; set; }
        public bool IsRunning { get; set; }

        public bool CanWriteText { get; set; }

        public ConsoleCursorReader(ConsolePageUI pageUi, Func<ConsoleKeyInfo, bool> executeChar = null)
        {
            ExecuteChar = executeChar;
            PageUI = pageUi;
            IsRunning = true;
        }

        public bool TryReadLine(out string result)
        {

            var hPosition = PageUI.StartInputPositionX;
            var buf = new StringBuilder();
            result = "";
            for (; ; )
            {
                if (!IsRunning) return false;
                ConsoleKeyInfo key = Console.ReadKey(true);
                var previousposH = Console.CursorLeft;
                Console.CursorLeft = hPosition;
                switch (key.Key)
                {
                    case ConsoleKey.UpArrow: SelectCommand(ConsoleCommand.Up, key); return false;
                    case ConsoleKey.DownArrow: SelectCommand(ConsoleCommand.Down, key); return false;
                    case ConsoleKey.LeftArrow: SelectCommand(ConsoleCommand.Left, key); return false;
                    case ConsoleKey.RightArrow: SelectCommand(ConsoleCommand.Right, key); return false;
                    case ConsoleKey.F12: SelectCommand(ConsoleCommand.Quit, key); return false;
                    case ConsoleKey.F5: SelectCommand(ConsoleCommand.Select, key); return false;
                    case ConsoleKey.Escape: SelectCommand(ConsoleCommand.Back, key); return false;
                    case ConsoleKey.F11: SelectCommand(ConsoleCommand.Redraw, key); return false;
                    case ConsoleKey.Enter:
                        result = buf.ToString();
                        SelectCommand(ConsoleCommand.Confirm, key);
                        if (!string.IsNullOrWhiteSpace(result))
                            PageUI.RedrawInput();
                        return true;
                    case ConsoleKey.Delete:
                        break;
                    case ConsoleKey.Backspace:
                        if (!CanWriteText) continue;
                        if (buf.Length < 1) continue;
                        buf.Remove(buf.Length - 1, 1);
                        Console.Write("\b \b");
                        if (hPosition > PageUI.StartInputPositionX)
                            hPosition--;
                        continue;
                }
                if (!CanWriteText) continue;
                if (ExecuteChar != null && ExecuteChar(key)) return true;
                if (key.KeyChar != 0)
                {
                    buf.Append(key.KeyChar);
                    Console.Write(key.KeyChar);
                    hPosition++;
                }
                Console.CursorLeft = previousposH;
                Console.CursorLeft = hPosition;
            }
        }
        private bool SelectCommand(ConsoleCommand command, ConsoleKeyInfo key)
        {
            Command = command;
            if (ExecuteChar != null && ExecuteChar(key))
            {
                //reset command;
                Command = ConsoleCommand.Unknown;
                return true;
            }
            return false;
        }

        private int minimum = 0;
        private int maximum;
        private int IntValue;
        public bool GetInt(int min, int max, out int value)
        {
            minimum = min;
            maximum = max;
            string input;
            value = -1;
            if (max < 10) ExecuteChar = ExecuteCharForInt;
            TryReadLine(out input);
            value = IntValue;
            return true;
        }
        private bool ExecuteCharForInt(ConsoleKeyInfo charr)
        {
            if (
                charr.Key == ConsoleKey.Escape || charr.Key == ConsoleKey.Enter || charr.Key == ConsoleKey.F12 || charr.Key == ConsoleKey.F11 || charr.Key == ConsoleKey.Enter ||
                charr.Key == ConsoleKey.UpArrow || charr.Key == ConsoleKey.DownArrow || charr.Key == ConsoleKey.LeftArrow || charr.Key == ConsoleKey.RightArrow || charr.Key == ConsoleKey.PageDown
                )
                return false;
            return GetInt(charr.KeyChar.ToString());
        }
        private bool GetInt(string input)
        {
            int value;
            if (!int.TryParse(input, out value))
            {
                PageUI.WriteError("Wrong input");
                return false;
            }
            if (value >= minimum && value < maximum)
            {
                IntValue = value;
                return true;
            }
            return false;
        }
    }
}
