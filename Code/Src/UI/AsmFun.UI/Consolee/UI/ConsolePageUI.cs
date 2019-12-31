#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.UI.Consolee.Data;
using System;
using System.Collections.ObjectModel;
using System.Runtime.InteropServices;
using System.Text;

namespace AsmFun.UI.Consolee.UI
{
    public class ConsolePageUI
    {


        #region Properties

        public bool UseConsoleBufferSizeForSize { get; set; }
        public ConsoleStyleSheet StyleSheet { get; set; }
        public int PageWidth { get; set; }
        public int PageHeight { get; set; }
        public ConsolePainter ConsolePainter { get; set; }
        public string PageHeader { get; set; } = "  ";
        public ConsoleMenuData HeaderMenu { get; set; }
        public string PageTitle { get; set; } = "  ";

        public int StartInputPositionY = 30;
        public int StartInputPositionX = 2;
        public int InputWidth = Console.BufferWidth - 6;
        public ObservableCollection<ConsoleVMenuUI> ConsoleVMenuUIs = new ObservableCollection<ConsoleVMenuUI>();
        #endregion


        #region Constructor/Init
        public ConsolePageUI(ConsoleStyleSheet consoleStyleSheet)
        {
            UseConsoleBufferSizeForSize = true;
            //HeaderMenu = new ConsoleMenuData
            //                 {
            //                      new ConsoleMenuItemData
            //                         {Id = "05", Title = "Select"},
            //                     new ConsoleMenuItemData
            //                         {Id = "11", Title = "Redraw"},
            //                     new ConsoleMenuItemData
            //                         {Id = "12", Title = "Quit"},
            //                     new ConsoleMenuItemData
            //                         {Id = "ESC", Title = "Back"}
            //                 };

            ConsolePainter = new ConsolePainter();
            ConsolePainter.MenuWidth = PageWidth = GetPageWidth();
            StyleSheet = consoleStyleSheet;
            //Console.SetBufferSize(100, 50);
            UpdatePageSize();
            
        }

        public void Init()
        {
            UpdatePageSize();
        }
        #endregion

        public void UpdatePageSize()
        {
            PageWidth = GetPageWidth();
            PageHeight = GetPageHeight();
            StartInputPositionY = PageHeight - 4;
        }

        private void ResetCursor()
        {
            Console.SetCursorPosition(0, 0);
        }

        private int GetPageWidth(){return RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? Console.WindowWidth : Console.BufferWidth; }
        private int GetPageHeight(){return RuntimeInformation.IsOSPlatform(OSPlatform.Windows) ? Console.WindowHeight : 22;}

        #region Menus
        public void AddMenu(ConsoleMenuData consoleMenuData)
        {
            consoleMenuData.ConsoleVMenuUI = new ConsoleVMenuUI(ConsolePainter, consoleMenuData);
            ConsoleVMenuUIs.Add(consoleMenuData.ConsoleVMenuUI);
            UpdateMenuPositioning(consoleMenuData.ConsoleVMenuUI);
        }
        private void UpdateMenuPositioning(ConsoleVMenuUI consoleVMenuUI)
        {
            consoleVMenuUI.SelectPositionDescriptionX = 0;
            consoleVMenuUI.SelectPositionDescriptionY = PageHeight - 1;
            consoleVMenuUI.StyleSheet = StyleSheet;
        }
        #endregion


        #region Page

        /// <summary>
        /// Will redraw the full page
        /// </summary>
        public void Redraw()
        {
            if (UseConsoleBufferSizeForSize)
            {
                PageWidth = Console.BufferWidth;
                PageHeight = GetPageHeight();
            }
            StartInputPositionY = PageHeight - 3;
            foreach (var consoleVMenuUi in ConsoleVMenuUIs)
                UpdateMenuPositioning(consoleVMenuUi);
            StyleSheet.SetPageHeaderStyle();
            DrawHeader();
            Console.CursorTop = 1;
            Console.CursorLeft = 0;
            StyleSheet.SetPageStyle();
            // Make background
            var sb = new StringBuilder();
            for (int i = 1; i < PageHeight - 2; i++)
                ConsolePainter.AddBorderedLine(sb,PageWidth);
            Console.CursorTop = 1;
            Console.CursorLeft = 0;
            Console.Write(sb);
            DrawTitle(1, PageTitle);
            DrawFooter();
            foreach (var consoleVMenuUi in ConsoleVMenuUIs)
                consoleVMenuUi.Draw();
            ResetCursor();
        }

        public void SetCursor(int x, int y)
        {
            Console.SetCursorPosition(x, y);
        }

        public void DrawHeader()
        {
            StyleSheet.SetPageHeaderStyle();
            Console.CursorTop = 0;
            Console.CursorLeft = 0;
            // remove all
            Console.Write(new string(' ', PageWidth - PageHeader.Length));
            // draw top
            Console.CursorLeft = PageWidth - PageHeader.Length;
            Console.Write(PageHeader);
            Console.CursorTop = 0;
            Console.CursorLeft = 0;
            if (HeaderMenu != null)
            {
                foreach (var menuItem in HeaderMenu)
                {
                    Console.CursorTop = 0;
                    StyleSheet.SetColorFMenu();
                    Console.Write(" " + menuItem.Id);
                    StyleSheet.SetColorFMenuText();
                    Console.Write(menuItem.Title);
                }
            }
        }
        public void DrawHeader(string text)
        {
            StyleSheet.SetPageHeaderStyle();
            Console.CursorTop = 0;
            Console.CursorLeft = 0;
            Console.Write(text);
        }

        public void DrawFooter()
        {
            StyleSheet.SetPageFooterStyle();
            Console.CursorTop = PageHeight - 2;
            Console.CursorLeft = 0;
            Console.Write(ConsoleCharSet.I.CharBottomLeft);
            Console.Write(new string(ConsoleCharSet.I.CharH, PageWidth - 2));
            Console.Write(ConsoleCharSet.I.CharBottomRight);
            Console.CursorLeft = 0;
        }
        #endregion


        #region Title 
        public void DrawTitle(int vPos, string title)
        {
            StyleSheet.SetMenuTitleLineColor();
            Console.CursorTop = vPos;
            Console.CursorLeft = 0;
            var text = " " + title + " ";
            var length = text.Length;
            var rest = text.Length % 2;
            var charcount = (PageWidth - length) / 2;
            Console.Write(ConsoleCharSet.I.CharTopLeft);
            Console.Write(new string(ConsoleCharSet.I.CharH, charcount-1));
            StyleSheet.SetMenuTitleColor();
            Console.Write(text);
            StyleSheet.SetMenuTitleLineColor();
            Console.Write(new string(ConsoleCharSet.I.CharH, charcount + rest-2));
            Console.Write(ConsoleCharSet.I.CharTopRight);
            StyleSheet.SetPageStyle();
        }

        #endregion

        private bool isInputVisible = false;
        #region Input
        public void DrawAskParameter(string title, string question)
        {
            isInputVisible = true;
            InputWidth = Console.BufferWidth - 22;
            if (InputWidth < 30)
            {
                InputWidth = 30;
                if (Console.BufferWidth <= 30)
                    InputWidth = Console.BufferWidth - 2;
            }
            DrawPopup(title, InputWidth, 5);
            StartInputPositionX = Console.CursorLeft;
            StartInputPositionY = Console.CursorTop + 1;
            Console.SetCursorPosition(StartInputPositionX, StartInputPositionY - 1);
            if (question != null) Console.Write(question);
            Console.SetCursorPosition(StartInputPositionX, StartInputPositionY);
            //StyleSheet.SetAskParameterColor();
            //Console.Write(s);
        }
        public void RedrawInput()
        {
            if (!isInputVisible) return;
            Console.CursorTop = StartInputPositionY;
            Console.CursorLeft = StartInputPositionX;
            StyleSheet.SetInputColor();
            Console.Write(new string(' ', InputWidth - 3));
            Console.CursorTop = StartInputPositionY;
            Console.CursorLeft = StartInputPositionX;
            Console.CursorVisible = true;
        }

        public void HideAskParameter()
        {
            isInputVisible = false;
            Console.CursorVisible = false;
        }

        public void WriteError(string error)
        {
            Console.CursorTop = StartInputPositionY + 1;
            Console.CursorLeft = StartInputPositionX + 1;
            StyleSheet.SetErrorColor();
            Console.Write(error);
            ResetCursor();
        }
        #endregion


        private void DrawPopup(string title, int boxwidth = 30, int boxheight = 6)
        {
            var startx = (int)Math.Round((double)PageWidth / 2 - boxwidth / 2, 0);
            var starty = (int)Math.Round((double)PageHeight / 2 - boxheight / 2, 0);
            ConsolePainter.DrawBox(StyleSheet, title, startx, starty, boxwidth, boxheight);
            Console.SetCursorPosition(startx + 1, starty + 1);
        }
    }
}
