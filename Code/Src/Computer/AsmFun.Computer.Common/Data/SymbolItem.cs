﻿using System.Diagnostics;

namespace AsmFun.Computer.Common.Data
{
    [DebuggerDisplay("SymbolItem:{Address.ToString(\"16\")}:{Name}:{Description}")]
    public class SymbolItem
    {
        public int Address { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        /// <summary>
        /// Number of bytes
        /// </summary>
        public int Length { get; set; }
    }
}