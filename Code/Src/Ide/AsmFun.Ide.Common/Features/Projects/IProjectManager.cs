#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Collections.Generic;
using System.Threading.Tasks;

namespace AsmFun.Ide.Common.Features.Projects
{
    public interface IProjectManager
    {
        Task<ProjectSettings> LoadByFileSelectorPopupAsync();
        ProjectSettings LoadByMainFilename(string mainFileNameWithFolder);
        ProjectSettings LoadByFolder(string folder);
        ProjectSettings LoadLastOpened();
        ProjectSettings LoadWebExisting(ProjectDetail projectDetail);
        ProjectSettings LoadLocalExisting(string projectFolder);
        void SaveProjectSettings(ProjectSettings projectSettings);
        ProjectSettings GetCurrentProjectSettings();
        void LoadProgramInPC();
        ProjectSettings CreateNew(string nameForFileSystem, string developerName, BuildConfiguration buildConfiguration);
        BuildConfiguration GetBuildConfiguration(ProjectSettings projectSettings = null);
        List<ProjectDetail> GetWebProjects();
        void SelectBuildConfigurationByIndex(int index);
        ProjectSettings LoadProgram(string programFileName);
    }
}