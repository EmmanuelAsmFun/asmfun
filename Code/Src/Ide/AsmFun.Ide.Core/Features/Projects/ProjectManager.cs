#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer;
using AsmFun.Ide.Common.Features.Ide;
using AsmFun.Ide.Common.Features.Projects;
using AsmFun.Ide.Core.Features.Files;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AsmFun.Ide.Core.Features.Projects
{
    public class ProjectManager : IProjectManager
    {
        private readonly IProjectSettingsDA projectSettingsDA;
        private readonly IFileSelectorPopup fileSelectorPopup;
        private readonly IComputerManager computerManager;
        private readonly IProjectDA projectDA;
        private readonly IUserSettingsDA userSettingsDA;

        private ProjectSettings currentSettings;
        private BuildConfiguration currentBuildConfiguration;


        public ProjectManager(IProjectSettingsDA projectSettingsDA, IFileSelectorPopup fileSelectorPopup, IComputerManager computerManager
            , IProjectDA projectDA, IUserSettingsDA userSettingsDA)
        {
            this.projectSettingsDA = projectSettingsDA;
            this.fileSelectorPopup = fileSelectorPopup;
            this.computerManager = computerManager;
            this.projectDA = projectDA;
            this.userSettingsDA = userSettingsDA;
        }

       
        public void CreateNew(string projectFolderFileName)
        {
            if (projectFolderFileName != null)
                projectFolderFileName = projectFolderFileName.Trim();
            var settings = projectSettingsDA.CreateNewByFilename(projectFolderFileName,null);
            SelectProject(settings);
        }

        public ProjectSettings GetCurrentProjectSettings()
        {
            return currentSettings;
        }

        public ProjectSettings LoadLastOpened()
        {
            var projectFolder = userSettingsDA.Load().LastOpenedProjectFolder;
            return LoadByFolder(projectFolder);
        }
        public Task<ProjectSettings> LoadByFileSelectorPopupAsync()
        {
            var task = new TaskCompletionSource<ProjectSettings>();
            fileSelectorPopup.Open((f) =>
            {
                var projectSettings = LoadByMainFilename(f);
                task.SetResult(projectSettings);
            });
            return task.Task;
        }
        public ProjectSettings LoadByFolder(string projectFolder)
        {
            if (string.IsNullOrWhiteSpace(projectFolder)) return null;
            var projectSettings = projectSettingsDA.LoadByFolder(projectFolder);
            SelectProject(projectSettings);
            return projectSettings;
        } 
        public ProjectSettings LoadByMainFilename(string mainFileNameWithFolder)
        {
            if (string.IsNullOrWhiteSpace(mainFileNameWithFolder)) return null;
            mainFileNameWithFolder = mainFileNameWithFolder.Trim();
            var fileNameOnly = System.IO.Path.GetFileName(mainFileNameWithFolder);
            if (fileNameOnly == "AsmFunSettings.json")
                return LoadBySettings(mainFileNameWithFolder);
            var projectSettings = projectSettingsDA.LoadByMainFilename(mainFileNameWithFolder);
            SelectProject(projectSettings);
            return projectSettings;
        }
        public ProjectSettings LoadWebExisting(ProjectDetail projectDetail)
        {
            var settings = projectDA.LoadWebExisting(projectDetail);
            return SelectProject(settings);
        }

        public ProjectSettings LoadBySettings(string settingsFileName)
        {
            var projectSettings = projectDA.LoadBySettings(settingsFileName);
            SelectProject(projectSettings);
            return projectSettings;
        }
        public ProjectSettings LoadLocalExisting(string projectFolder)
        {
            if (string.IsNullOrWhiteSpace(projectFolder)) return null;
            projectFolder = projectFolder.Trim();
            var settings = projectDA.LoadLocalExisting(projectFolder);
            return SelectProject(settings);
        }
        private ProjectSettings SelectProject(ProjectSettings settings)
        {
            if (settings == null || settings.Detail == null) return null;
            currentSettings = settings;
            UpdateChangedUserSettings(settings);
            return currentSettings;
        }

        private void UpdateChangedUserSettings(ProjectSettings settings)
        {
            var userSettings = userSettingsDA.Get();
            var changed = false;
            if (userSettings.ComputerSettings != null)
            {
                var config = GetBuildConfiguration(settings);
                if (config != null)
                {

                    if (!string.IsNullOrWhiteSpace(config.RomVersion) && userSettings.ComputerSettings.ComputerVersion != config.RomVersion)
                    {
                        changed = true;
                        userSettings.ComputerSettings.ComputerVersion = config.RomVersion;
                    }
                    if (config.ComputerType != ProjectComputerTypes.Unknown && userSettings.ComputerSettings.ComputerType != config.ComputerType.ToString())
                    {
                        userSettings.ComputerSettings.ComputerType = config.ComputerType.ToString();
                        changed = true;
                    }
                }
            }

            if (userSettings.LastOpenedProjectFolder != settings.Detail.FullFolderName && !string.IsNullOrWhiteSpace(settings.Detail.FullFolderName))
            {
                userSettings.LastOpenedProjectFolder = settings.Detail.FullFolderName;
                changed = true;
            }
            if (changed)
                if (!settings.IsProgramOnly)
                {
                    userSettingsDA.Save(userSettings);
                }
        }

        public void SaveProjectSettings(ProjectSettings projectSettings)
        {
            // parse the data, not override
            currentSettings = projectSettings;
            // If it's a program only, we don't want to save.
            if (!projectSettings.IsProgramOnly)
                projectSettingsDA.Save(currentSettings);
            else
                projectSettingsDA.UpdateWithoutSave(currentSettings);
            UpdateChangedUserSettings(projectSettings);
        }

        public void LoadProgramInPC()
        {
            if (currentSettings.SelectedConfiguration >= currentSettings.Configurations.Count)
                currentSettings.SelectedConfiguration = 0;
            currentBuildConfiguration = currentSettings.Configurations[currentSettings.SelectedConfiguration];
            computerManager.LoadProgramInPc(currentBuildConfiguration.ProgramFileName);
        }

        public ProjectSettings CreateNew(string nameForFileSystem, string developerName, BuildConfiguration buildConfiguration)
        {
            nameForFileSystem = nameForFileSystem.Trim();
            var settings = projectDA.CreateNew(nameForFileSystem, developerName, buildConfiguration);
            return SelectProject(settings);
        }

      

        public List<ProjectDetail> GetWebProjects()
        {
            return projectDA.GetWebProjects();
        }

        public BuildConfiguration GetBuildConfiguration(ProjectSettings projectSettings = null)
        {
            if (projectSettings == null)
                projectSettings = currentSettings;
            if (projectSettings == null) return null;
            if (projectSettings.SelectedConfiguration >= projectSettings.Configurations.Count)
                projectSettings.SelectedConfiguration = 0;
            return projectSettings.Configurations[projectSettings.SelectedConfiguration];
        }

        public void SelectBuildConfigurationByIndex(int index)
        {
            if (index >= currentSettings.Configurations.Count) return;
            if (index < 0) return;
            currentSettings.SelectedConfiguration = index;
            currentBuildConfiguration = currentSettings.Configurations[currentSettings.SelectedConfiguration];
        }

        public ProjectSettings LoadProgram(string programFileName)
        {
            var settings = projectSettingsDA.CreateNewForProgram(programFileName);
            SelectProject(settings);
            return settings;
        }
    }
}
