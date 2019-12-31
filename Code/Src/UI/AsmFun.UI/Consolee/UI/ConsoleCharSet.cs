#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.UI.Consolee.UI
{
    public class ConsoleCharSet
    {

        public virtual char CharV { get { return '│'; } }
        public virtual char CharH { get { return '─'; } }
        public virtual char CharLineHLeft { get { return '├'; } }//
        public virtual char CharLineHRight { get { return '┤'; } }//
        public virtual char CharTopLeft { get { return '┌'; } }//
        public virtual char CharTopRight { get { return '┐'; } }//
        public virtual char CharBottomLeft { get { return '└'; } }//
        public virtual char CharBottomRight { get { return '┘'; } }//
        public virtual char CharScollerBG { get { return ' '; } }
        public virtual char CharScoller { get { return '|'; } }
        public virtual char CharCross { get { return '■'; } }


        private static ConsoleCharSet instance;
        public static ConsoleCharSet I
        {
            get
            {
                if (instance == null) return new ConsoleCharSet();
                return instance;
            }
            set { instance = value; }
        }
    }
}
