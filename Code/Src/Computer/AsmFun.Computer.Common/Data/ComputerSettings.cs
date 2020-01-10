#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion


namespace AsmFun.Computer.Common.Data
{

    public class ComputerSettings
    {
        /// <summary>
        /// CommanderX16
        /// </summary>
        public string ComputerType{ get; set; }
        public string ComputerVersion { get; set; }

        public ComputerSettings()
        {
            ComputerType = "CommanderX16";
            ComputerVersion = "R36";
        }
    }
}
