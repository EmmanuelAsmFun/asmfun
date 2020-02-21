#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.DataAccess;
using AsmFun.Common.ServiceLoc;
using AsmFun.Core.Tools;
using AsmFun.Ide.Common.Features.Projects;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace AsmFun.Ide.Core.Features.Projects
{
    public class ProjectSettingsDA : IProjectSettingsDA
    {
        private const string FILENAME = "AsmFunSettings.json";
        private const string FOLDER = "AsmFun";

        private readonly IAsmJSonSerializer serializer;
        private readonly IEmServiceResolverFactory container;
        private string projectCompleteFolder;
        private string projectMainFileNameWithFolder;

        public string StorageFolder { get; set; }
        public string StorageFileName { get; set; }

        public ProjectSettingsDA(IAsmJSonSerializer serializer, IEmServiceResolverFactory container)
        {
            this.serializer = serializer;
            this.container = container;
        }


        #region Load
        public ProjectSettings TryLoadByFolderOrCreate(string projectFolder, string hintStartFile)
        {
            StorageFileName = null;
            StorageFolder = null;
            projectCompleteFolder = projectFolder;
            PrepareFolder();
            PrepareFileName();
            if (!File.Exists(StorageFileName))
            {
                if (string.IsNullOrWhiteSpace(hintStartFile))
                    hintStartFile = "Main.asm";
                projectMainFileNameWithFolder = Path.Combine(projectFolder, hintStartFile);
                if (!File.Exists(projectMainFileNameWithFolder))
                {
                    var potentialFiles = Directory.GetFiles(projectFolder, "*.a");
                    if (potentialFiles.Length == 0)
                        potentialFiles = Directory.GetFiles(projectFolder, "*.asm");
                    if (potentialFiles.Length > 0)
                        projectMainFileNameWithFolder = potentialFiles.First();
                }
                var settings = CreateNewByFilename(projectMainFileNameWithFolder, projectFolder);
                return settings;
            }
            var cloudSettings = LoadByFolder(projectFolder);
            return cloudSettings;
        }

        public ProjectSettings LoadBySettings(string settingsFileName)
        {
            projectCompleteFolder = Directory.GetParent(Directory.GetParent(settingsFileName).FullName).FullName;
            StorageFolder = projectCompleteFolder;
            StorageFileName = settingsFileName;
            var settings = Load();
            return settings;
        }
        public ProjectSettings LoadByMainFilename(string projectMainFileNameAndFolder)
        {
            projectMainFileNameWithFolder = projectMainFileNameAndFolder;
            projectCompleteFolder = Path.GetDirectoryName(projectMainFileNameAndFolder);
            if (string.IsNullOrWhiteSpace(projectCompleteFolder)) return null;
            PrepareFolder();
            PrepareFileName();
            var settings = Load();
            return settings;
        }

        public ProjectSettings LoadByFolder(string projectFolder)
        {
            projectCompleteFolder = projectFolder;
            PrepareFolder();
            PrepareFileName();
            var settings = Load();
            return settings;
        }
        private ProjectSettings Load()
        {
            ProjectSettings settings = null;
            var projectFolder = Path.GetDirectoryName(StorageFileName);
            if (projectFolder.EndsWith("AsmFun",StringComparison.InvariantCultureIgnoreCase))
                projectFolder = Directory.GetParent(projectFolder).FullName;
            if (!Directory.Exists(projectFolder)) return null;
            PrepareFolder();
            PrepareFileName();
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
                    settings = serializer.DeserializeObject<ProjectSettings>(data);
                    settings.Folder = Directory.GetParent(Path.GetDirectoryName(StorageFileName)).FullName;
                    if (settings.Detail != null) settings.Detail.FullFolderName = settings.Folder;
                }
                catch (Exception)
                {
                    settings = CreateNew();
                }
            }
            container.Update(settings);
            return settings;
        }
        #endregion


        public void Save(ProjectSettings settings)
        {
            var dataString = serializer.SerializeObject(settings);
            // Deserialize to remove some props.
            var data = serializer.DeserializeObject<ProjectSettings>(dataString);
            data.Folder = null;
            if (data.Detail != null)
            {
                data.Detail.FullFolderName = null;
                data.Detail.StartFile = null;
            }
            dataString = serializer.SerializeObject(data);
            if (File.Exists(StorageFileName))
                File.Delete(StorageFileName);
            File.WriteAllText(StorageFileName, dataString);
            // We need to replace the existing settings
            container.Update(settings);
        }
        public void UpdateWithoutSave(ProjectSettings currentSettings)
        {
           container.Update(currentSettings);
        }


        public ProjectSettings CreateNewByFilename(string projectFolderFileName,string projectFolder)
        {
            if (string.IsNullOrWhiteSpace(projectFolderFileName))
            {
                var tempf = AppDomain.CurrentDomain.RelativeSearchPath ?? AppDomain.CurrentDomain.BaseDirectory;
                projectFolderFileName = Path.Combine(tempf, "Projects", "NewProject");
                if (!Directory.Exists(projectFolderFileName))
                    Directory.CreateDirectory(projectFolderFileName);
                projectFolderFileName = Path.Combine(projectFolderFileName, "main.o");
                File.WriteAllText(projectFolderFileName, " ");
            }
           
            projectMainFileNameWithFolder = projectFolderFileName;
            projectCompleteFolder = projectFolder != null? projectFolder: Path.GetDirectoryName(projectFolderFileName);
            PrepareFolder();
            PrepareFileName();
            // reset settings
            var settings = CreateNew();
            settings.Folder = projectFolder;
            settings.Detail.FullFolderName = projectFolder;

            Save(settings);
            return settings;
        }

        private ProjectSettings CreateNew()
        {
            if (string.IsNullOrWhiteSpace(projectMainFileNameWithFolder))
                projectMainFileNameWithFolder = Path.Combine(projectCompleteFolder, "main.asm");
            var sourceCodeFolder = Path.GetDirectoryName(projectMainFileNameWithFolder);
            if (!string.IsNullOrWhiteSpace(sourceCodeFolder))
                sourceCodeFolder = sourceCodeFolder.Replace(projectCompleteFolder, "");
            var startupFile = projectMainFileNameWithFolder.Replace(projectCompleteFolder, "");
            var programName = Path.GetFileNameWithoutExtension(projectMainFileNameWithFolder);
            var settings = new ProjectSettings
            {
                Folder = projectCompleteFolder,
                StartupFile = startupFile,
                SourceCodeFolder = sourceCodeFolder,
                ReportFileName = "report.rep",
                LabelsFileName = "labels.sym",
                Configurations = new List<BuildConfiguration> { CreateDefaultConfiguration() },
                Detail = new ProjectDetail
                {
                    Id = Guid.NewGuid(),
                    Description="",
                    Name = programName,
                    ImageUrl = "",
                    InternetSource = "",
                    InternetSourceType = InternetSourceType.ZipUrl,
                    FullFolderName = projectCompleteFolder
                },
                SelectedConfiguration =0
            };
            settings.Configurations = new List<BuildConfiguration> { 
                CreateDefaultConfiguration()
            };
            settings.Configurations[0].ProgramFileName = startupFile;
            return settings;
        }


        public BuildConfiguration CreateDefaultConfiguration()
        {
            return new BuildConfiguration
            {
                OutputFolderName = "output",
                CompilerType = ProjectCompilerTypes.ACME,
                ComputerType = ProjectComputerTypes.CommanderX16,
                RomVersion = "R36",
                AddonCommandLine = "",
                ProgramFileName = "",
                CompilerVariables = "",
            };
        }


        private void PrepareFolder()
        {
            StorageFolder = Path.Combine(projectCompleteFolder, FOLDER);
            if (!Directory.Exists(StorageFolder))
                Directory.CreateDirectory(StorageFolder);
        }

        private void PrepareFileName()
        {
            StorageFileName = FileHelper.FixFolderForOS(Path.Combine(StorageFolder, FILENAME));
        }

        public ProjectSettings CreateNewForProgram(string programFileName)
        {
            projectCompleteFolder = Directory.GetParent(programFileName).FullName;
            var fileName = Path.GetFileName(programFileName);
            var settings = new ProjectSettings
            {
                Folder = projectCompleteFolder,
                IsProgramOnly = true,
                StartupFile = null,
                SourceCodeFolder = fileName,
                ReportFileName = "report.rep",
                LabelsFileName = "labels.sym",
                Configurations = new List<BuildConfiguration> { CreateDefaultConfiguration() },
                Detail = new ProjectDetail
                {
                    Id = Guid.NewGuid(),
                    Description = "",
                    Name = fileName,
                    ImageUrl = "",
                    InternetSource = "",
                    InternetSourceType = InternetSourceType.Unknown,
                    FullFolderName = projectCompleteFolder
                },
                SelectedConfiguration = 0
            };
            settings.Configurations[0].ProgramFileName = programFileName;
            return settings;
        }

     
    }
}
