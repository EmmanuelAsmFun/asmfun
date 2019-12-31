#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;

namespace AsmFun.UI.Consolee.UI
{
    public class ConsoleStyleSheet
    {
        public ConsoleColor PageBackground = ConsoleColor.DarkBlue;
        public ConsoleColor PageForeground = ConsoleColor.Gray;

        #region Page style
        public void SetPageStyle()
        {
            Console.ForegroundColor = PageForeground;
            Console.BackgroundColor = PageBackground;
        }
        public void SetPageHeaderStyle()
        {
            Console.ForegroundColor = ConsoleColor.DarkGray;
            Console.BackgroundColor = ConsoleColor.Black;
        }
        public void SetPageFooterStyle()
        {
            Console.ForegroundColor = ConsoleColor.Gray;
            Console.BackgroundColor = ConsoleColor.DarkBlue;
        }
        #endregion

        internal void SetMenuTitleLineColor()
        {
            Console.ForegroundColor = ConsoleColor.Gray;
            Console.BackgroundColor = ConsoleColor.DarkBlue;
        }
        public void SetMenuTitleColor()
        {
            Console.ForegroundColor = ConsoleColor.Gray;
            Console.BackgroundColor = ConsoleColor.DarkBlue;
        }

        public void SetMenuStyle(bool isSelectable, int menuDepth)
        {
            Console.ForegroundColor = PageForeground;
            Console.BackgroundColor = PageBackground;
            if (!isSelectable)
                Console.ForegroundColor = ConsoleColor.Blue;

        }
        public void SetMenuSelectStyle(bool isSelectable, bool isActivated, int menuDepth)
        {
            if (isActivated)
            {
                Console.ForegroundColor = ConsoleColor.DarkGreen;
                Console.BackgroundColor = ConsoleColor.White;
                if (!isSelectable)
                    Console.ForegroundColor = ConsoleColor.DarkBlue;
            }
            else
            {
                Console.ForegroundColor = ConsoleColor.White;
                Console.BackgroundColor = ConsoleColor.DarkGray;
                if (!isSelectable)
                    Console.ForegroundColor = ConsoleColor.DarkBlue;
            }

        }


        #region FMenu
        internal void SetColorFMenu()
        {
            Console.ForegroundColor = ConsoleColor.Black;
            Console.BackgroundColor = ConsoleColor.DarkGray;
        }

        internal void SetColorFMenuText()
        {
            Console.ForegroundColor = ConsoleColor.Gray;
            Console.BackgroundColor = ConsoleColor.Black;
        }
        #endregion


        public void SetControlListTitleColor()
        {
            Console.ForegroundColor = ConsoleColor.White;
            Console.BackgroundColor = PageBackground;
        }
        public void SetControlListColor(bool isSelectable)
        {
            Console.ForegroundColor = ConsoleColor.Gray;
            Console.BackgroundColor = PageBackground;// ConsoleColor.DarkGreen; // PageBackground;
            if (!isSelectable)
                Console.ForegroundColor = ConsoleColor.DarkGray;
        }


        #region Input styles
        public void SetInputColor()
        {
            Console.ForegroundColor = ConsoleColor.Gray;
            Console.BackgroundColor = ConsoleColor.Black;
        }
        public void SetAskParameterColor()
        {
            Console.ForegroundColor = ConsoleColor.Gray;
            Console.BackgroundColor = PageBackground;
        }

        public void SetErrorColor()
        {
            Console.ForegroundColor = ConsoleColor.DarkRed;
            Console.BackgroundColor = ConsoleColor.DarkGray;
        }
        #endregion

        public void SetBoxBgColor()
        {
            Console.ForegroundColor = ConsoleColor.Black;
            Console.BackgroundColor = ConsoleColor.DarkGray;
        }
        public void SetBoxShadowColor()
        {
            Console.ForegroundColor = ConsoleColor.White;
            Console.BackgroundColor = ConsoleColor.Black;
        }
    }
}