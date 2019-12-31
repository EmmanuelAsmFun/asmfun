#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Ide.Common.Data;
using System.Collections.Generic;

namespace AsmFun.Ide.Common.DataAccess
{
    public interface IProjectDA
    {
        ProjectSettings CreateNew(string nameForFileSystem, string developerName, BuildConfiguration buildConfiguration);
        ProjectSettings LoadWebExisting(ProjectDetail projectDetail);
        ProjectSettings LoadLocalExisting(string settingsFolder);
        List<ProjectDetail> GetWebProjects();
    }
}
