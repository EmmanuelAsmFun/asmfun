#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Ide.Common.Features.Projects;
using System;
using System.Collections.Generic;

namespace AsmFun.Ide.Common.Features.Ide.Data
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
            ComputerSettings.Parse(userSettings.ComputerSettings);
        }

        public static void UpdateCompilers(IEmServiceResolverFactory fac, UserSettings userSettings)
        {
            if (userSettings.IdeSettings != null)
            {
                fac.Update(userSettings.IdeSettings.ACME).WithLifestyle(EmServiceLifestyle.Singleton);
                fac.Update(userSettings.IdeSettings.Cc65).WithLifestyle(EmServiceLifestyle.Singleton);
                fac.Update(userSettings.IdeSettings.VASM).WithLifestyle(EmServiceLifestyle.Singleton);
                fac.Update(userSettings.IdeSettings.DASM).WithLifestyle(EmServiceLifestyle.Singleton);
            }
        }
    }
}
