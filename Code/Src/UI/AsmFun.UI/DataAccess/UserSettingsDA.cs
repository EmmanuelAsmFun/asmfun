#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.DataAccess;
using AsmFun.Computer.Common.Data;
using AsmFun.Ide.Common.Data;
using System;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using AsmFun.Ide.Common.Compilation;
using AsmFun.Ide.Common.Compilation.ACME;
using System.Collections.Generic;
using AsmFun.Ide.Common.Compilation.VASM;
using AsmFun.Ide.Common.Compilation.DASM;
using AsmFun.Ide.Common.Compilation.Cc65;
using AsmFun.Ide.Common.DataAccess;

namespace AsmFun.Core.DataAccess
{
    public class UserSettingsDA : IUserSettingsDA
    {
        private readonly IAsmJSonSerializer jSonSerializer;
        public UserSettings UserSettings { get; set; }
        public string StorageFolder { get; set; }
        public string StorageFileName { get; set; }

        public UserSettingsDA(IAsmJSonSerializer jSonSerializer)
        {
            StorageFolder = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "AsmFun");
            if (!Directory.Exists(StorageFolder))
                Directory.CreateDirectory(StorageFolder);
            StorageFileName = Path.Combine(StorageFolder, "asmfunUserSettings.json");
            this.jSonSerializer = jSonSerializer;
        }
        public UserSettings Load()
        {
            UserSettings settings = null;
            if (!File.Exists(StorageFileName))
            {
                settings = CreateNew();
                Save(settings);
            }
            else
            {
                try
                {
                    var data = File.ReadAllText(StorageFileName);
                    settings = jSonSerializer.DeserializeObject<UserSettings>(data);
                }
                catch (Exception)
                {
                    settings = CreateNew();
                }
            }
            UserSettings = settings;
            // We could copy a project from one pc to another, so set it again.
            FillPlatform(settings);
            FillCompilers(settings);
            return settings;
        }
        public UserSettings Reset()
        {
            if (File.Exists(StorageFileName))
                File.Delete(StorageFileName);
            // reset settings
            var settings = CreateNew();
            UserSettings = settings;
            return settings;
        }
      
        public void Save(UserSettings settings)
        {
            var dataString = jSonSerializer.SerializeObject(settings);
            if (File.Exists(StorageFileName))
                File.Delete(StorageFileName);
            File.WriteAllText(StorageFileName, dataString);
            UserSettings = settings;
        }

        private UserSettings CreateNew()
        {
            var settings = new UserSettings
            {
                ComputerSettings = new ComputerSettings
                {
                  
                },
                IdeSettings = new IdeSettings
                {
                   
                },
                ProjectsFolder = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "AsmFun","Projects")
        };
            FillPlatform(settings);
            FillCompilers(settings);
            //settings.X16ComputerLinkSettings.MemoryExchangeFile = Path.Combine(settings.ComputerSettings.X16ComputerFolder, "x16emu_Addresses.bin");
            return settings;
        }
        private void FillCompilers(UserSettings settings)
        {
            var ACMEFileName = @"C:\Program Files\ACME\acme.exe";
            var VASMFileName = @"C:\Program Files\VASM\vasm.exe";
            var DASMFileName = @"C:\Program Files\DASM\dasm.exe";
            var Cc65FileName = @"C:\Program Files\CC65\Wincc65\bin\cl65.exe";
            if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                ACMEFileName = @"acme.exe";
                VASMFileName = @"vasm.exe";
                DASMFileName = @"dasm.exe";
                Cc65FileName = @"cl65.exe";
            }
            if (settings.IdeSettings.ACME == null) settings.IdeSettings.ACME = new ACMECompilerSettings { ACMEFileName = ACMEFileName, };
            if (settings.IdeSettings.VASM == null) settings.IdeSettings.VASM = new VASMCompilerSettings { VASMFileName = VASMFileName, };
            if (settings.IdeSettings.DASM == null) settings.IdeSettings.DASM = new DASMCompilerSettings { DASMFileName = DASMFileName, };
            if (settings.IdeSettings.Cc65 == null) settings.IdeSettings.Cc65 = new Cc65CompilerSettings { Cc65FileName = Cc65FileName, };
        }

        public UserSettings Get()
        {
            if (UserSettings == null) Load();
            return UserSettings;
        }
        private void FillPlatform(UserSettings userSettings)
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
                userSettings.Platform = "OSX";
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                userSettings.Platform = "Linux";
            else
                userSettings.Platform = "Windows";
            userSettings.ServerVersion = FileVersionInfo.GetVersionInfo(Assembly.GetEntryAssembly().Location).FileVersion;
        }
    }
}
