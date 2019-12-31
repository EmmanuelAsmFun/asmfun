#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.UI.Consolee.Data;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AsmFun.UI.Consolee.UI
{
   
    public class ConsoleVMenuUI
    {
        public int Width { get; set; }

        public int Height { get; set; }

        public int StartX { get; set; }
        public int StartY { get; set; }
        public ConsoleStyleSheet StyleSheet { get; set; }
        public ConsoleMenuData MenuData { get; set; }
        private bool ShowScrollBars { get; set; }
        public int StartShowIndex { get; private set; }
        public int ScrollTicks { get; private set; }
        public ConsolePainter ConsolePainter { get; private set; }
        public int SelectPositionDescriptionX { get; set; }
        public int SelectPositionDescriptionY { get; set; }

        public string Title { get; set; } = "  ";

        public ConsoleVMenuUI(ConsolePainter consolePainter, ConsoleMenuData menuData)
        {
            ConsolePainter = consolePainter;
            MenuData = menuData;
            StartShowIndex = 0;
        }
        private void ResetCursor()
        {
            Console.SetCursorPosition(0, 0);
        }
        public void Draw(bool redrawBorder = true, bool redrawScroll = true)
        {
            Title = MenuData.Title;
            if (redrawBorder)
            {
                StyleSheet.SetPageStyle();
                ConsolePainter.DrawBox(StyleSheet, Title, StartX - 1, StartY - 1, Width + 3, Height + 2, false, false);
            }
            if (redrawScroll)
            {
                StyleSheet.SetMenuSelectStyle(true, true, MenuData.MenuDepth);
                CalculateShowIndex();
                UpdateScrollBar();
            }
            var numItemsToShow = MenuData.Count;
            //if (ShowScrollBars)
            //numItemsToShow = Height;


            if (MenuData.Count == 0) return;
            for (int index = 0; index < numItemsToShow; index++)
                DrawMenuItem(index, false);

            for (int index = 0; index < Height - numItemsToShow; index++)
                DrawEmptyItem(index + MenuData.Count, false);
            ResetCursor();
        }
        public void DrawMenuItems(ICollection<int> listIndexes)
        {
            // do we have to redraw all the lines?
            if (CalculateShowIndex())
                Draw(false, true);
            else // only redraw changed lines
                foreach (var index in listIndexes)
                    DrawMenuItem(index);
        }

        public void DrawEmptyItem(int index, bool resetCursor = true)
        {
            var width = ShowScrollBars ? Width - 1 : Width;
            StyleSheet.SetControlListColor(false);
            if (StartX > Console.BufferWidth || StartX < 0) return;
            if (StartY + index >= Console.WindowHeight || StartY + index < 0) return;
            Console.SetCursorPosition(StartX, StartY + index);
            Console.Write(new string(' ', width));
            if (resetCursor) ResetCursor();
        }

        private void DrawMenuItem(int index, bool resetCursor = true)
        {
            var width = ShowScrollBars ? Width - 1 : Width;
            if (index + StartShowIndex >= Height) return;
            if (index + StartShowIndex < 0) return;
            var menuItem = MenuData[index];
            var title = menuItem.Title;
            if (title.Length > width) title = title.Substring(0, width);
            if (title.Length < width) title = title + new string(' ', width - title.Length);
            StyleSheet.SetControlListColor(menuItem.IsSelectable);
            if (menuItem.IsSelected) StyleSheet.SetMenuSelectStyle(menuItem.IsSelectable, MenuData.IsActivated, MenuData.MenuDepth);
            Console.SetCursorPosition(StartX, StartShowIndex + StartY + index);
            Console.Write(title);
            if (!string.IsNullOrWhiteSpace(menuItem.TitleRight))
            {
                var newX = StartX + Width - menuItem.TitleRight.Length - 1;
                var text = menuItem.TitleRight;
                if (newX < 0)
                {
                    text = text.Substring(0, newX * -1);
                    newX = StartX + Width - text.Length - 1;
                }
                try
                {
                    Console.SetCursorPosition(newX, StartShowIndex + StartY + index);
                    Console.Write(text);
                }
                catch
                {
                    int maxWidth = Width - 3;
                    newX = StartX + Width - maxWidth - 1;
                    text = menuItem.TitleRight.Substring(0, maxWidth);
                    Console.SetCursorPosition(newX, StartShowIndex + StartY + index);
                    Console.Write(text);
                }
            }
            if (menuItem.IsSelected)
            {
                StyleSheet.SetPageFooterStyle();
                if (SelectPositionDescriptionX >= Console.BufferWidth || SelectPositionDescriptionY >= Console.WindowHeight) return;
                // erase line
                Console.SetCursorPosition(SelectPositionDescriptionX, SelectPositionDescriptionY);
                Console.Write(new string(' ', Console.BufferWidth - 12));
                // write text
                Console.SetCursorPosition(SelectPositionDescriptionX, SelectPositionDescriptionY);
                Console.Write(!string.IsNullOrWhiteSpace(menuItem.Description) ? menuItem.Description : menuItem.Title);
            }
            if (resetCursor) ResetCursor();
        }
        private bool CalculateShowIndex()
        {
            ShowScrollBars = MenuData.Count > Height;

            if (!ShowScrollBars) return false;
            ScrollTicks = MenuData.Count - Height;
            var firstSelected = MenuData.FirstOrDefault(item => item.IsSelected);
            if (firstSelected == null) return false;
            var index = MenuData.IndexOf(firstSelected);
            //if (index > Height - 1) // && StartShowIndex < Height - index + 1)
            var showIndexAbs = Math.Abs(StartShowIndex);
            if (index >= Height - 1 + showIndexAbs)// && StartShowIndex < Height - index + 1)
            {
                StartShowIndex = Height - index - 1;
                return true;
            }
            if (index < showIndexAbs)
            {
                StartShowIndex = -index;
                return true;
            }
            return false;
        }
        private void UpdateScrollBar()
        {
            if (ScrollTicks == 0) return;
            var height = Height;
            for (int index = 0; index < height; index++)
            {
                Console.SetCursorPosition(StartX + Width - 1, StartY + index);
                Console.Write(ConsoleCharSet.I.CharScollerBG);
            }
            var percent = StartShowIndex * -1d / (ScrollTicks + 1);
            if (percent >= 0)
            {
                var scrollPos = Math.Round(percent * Height, 0);
                if (scrollPos >= height - 1) scrollPos = height - 1;
                Console.SetCursorPosition(StartX + Width - 1, StartY + (int)scrollPos);
                Console.Write(ConsoleCharSet.I.CharScoller);
            }
        }
    }
}
