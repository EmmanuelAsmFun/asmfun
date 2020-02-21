#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using System.Collections.Generic;

namespace AsmFun.Ide.Common.Features.Projects
{
    public enum ProjectCompilerTypes
    {
        Unknown = 0,
        ACME = 1,
        VASM = 2,
        DASM = 3,
        Cc65 = 4,
    }    
    public enum ProjectComputerTypes
    {
        Unknown,
        CommanderX16
    }
    public enum InternetSourceType
    {
        Unknown = 0,
        ZipUrl = 1,
        GitHub = 2,
        Bitbucket = 3,
    }
    public class ProjectSettings
    {
        public string Folder { get; set; }
        public string SourceCodeFolder { get; set; }
        public List<BuildConfiguration> Configurations { get; set; }
        public int SelectedConfiguration { get; set; }
        public ProjectDetail Detail { get; set; }
        public string ReportFileName { get; set; }
        public string LabelsFileName { get; set; }
        public string StartupFile { get; set; }
        /// <summary>
        /// Its a program only without source code
        /// </summary>
        public bool IsProgramOnly { get; set; }

        public ProjectSettings()
        {
            Configurations = new List<BuildConfiguration>();
        }
    }

    public class BuildConfiguration
    {
        public string AddonCommandLine { get; set; }
        public string ProgramFileName { get; set; }
        public string CompilerVariables { get; set; }
        public ProjectCompilerTypes CompilerType { get; set; }
        public ProjectComputerTypes ComputerType { get; set; }
        public string OutputFolderName { get; set; }
        public string RomVersion { get; set; }
    }

    public class ProjectDetail
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string FullFolderName { get; set; }
        public string ProjectUrl { get; set; }
        public string ImageUrl { get; set; }
        public string InternetSource { get; set; }
        public InternetSourceType InternetSourceType { get; set; }
        public string Description { get; set; }
        public string StartFile { get; set; }
        public string AddonBuildFolders { get; set; }
        public string DeveloperName { get; set; }
        public string DevPicUrl { get; set; }
        public string RomVersion { get; set; }
        public bool UnderConstruction { get; set; }
        public string CompilerVariables { get; set; }
        public string InternetVersion { get; set; }
        public ProjectDetail()
        {
            InternetVersion = "";
        }
    }
}
