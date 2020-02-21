#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Collections.Generic;

namespace AsmFun.Ide.Common.Features.Projects
{
    public interface IProjectDA
    {
        ProjectSettings CreateNew(string nameForFileSystem, string developerName, BuildConfiguration buildConfiguration);
        ProjectSettings LoadWebExisting(ProjectDetail projectDetail);
        ProjectSettings LoadBySettings(string settingsFileName);
        ProjectSettings LoadLocalExisting(string settingsFolder);
        List<ProjectDetail> GetWebProjects();
    }
}
