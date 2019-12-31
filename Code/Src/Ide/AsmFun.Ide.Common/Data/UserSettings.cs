#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Data;
using System;
using System.Collections.Generic;

namespace AsmFun.Ide.Common.Data
{
    public class UserSettings
    {
        public string LastOpenedProjectFolder { get; set; }
        public ComputerSettings ComputerSettings { get; set; }
        public IdeSettings IdeSettings { get; set; }
        public string Platform { get; set; }
        public string ServerVersion { get; set; }
        public string ProjectsFolder { get; set; }
        public List<ProjectDetail> LocalProjects { get; set; }

        public UserSettings()
        {
            LocalProjects = new List<ProjectDetail>();
        }

        public void Parse(UserSettings userSettings)
        {
            ProjectsFolder = userSettings.ProjectsFolder;
            IdeSettings.Parse(userSettings.IdeSettings);
        }
    }
}
