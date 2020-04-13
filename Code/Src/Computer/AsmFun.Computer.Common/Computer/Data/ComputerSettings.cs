#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion


using System;

namespace AsmFun.Computer.Common.Computer.Data
{

    public class ComputerSettings
    {
        /// <summary>
        /// CommanderX16
        /// </summary>
        public string ComputerType { get; set; }
        public string ComputerVersion { get; set; }
        public bool SoundEnabled { get; set; }
        public byte KeyMapIndex { get; set; }

        public ComputerSettings()
        {
            ComputerType = "CommanderX16";
            ComputerVersion = "R37";
        }

        public void Parse(ComputerSettings computerSettings)
        {
            SoundEnabled = computerSettings.SoundEnabled;
            KeyMapIndex = computerSettings.KeyMapIndex;
        }
    }
}
