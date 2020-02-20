#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Ide.Common.Data;
using AsmFun.Ide.Common.Data.Programm;
using AsmFun.Ide.Common.DataAccess;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;

namespace AsmFun.Ide.DataAccess
{
    public abstract class SourceCodeDA : ISourceCodeDA
    {
        protected bool isSaving;
        protected readonly IProjectManager projectManager;


        public SourceCodeDA(IProjectManager projectManager)
        {
            this.projectManager = projectManager;
        }

        public SourceCodeBundle LoadProgram(ProjectSettings projectSettings)
        {
            var bundle = LoadSource(projectSettings);
            if (string.IsNullOrWhiteSpace(projectSettings.StartupFile)) return bundle;
            var buildConfiguration = projectManager.GetBuildConfiguration(projectSettings);
            if (buildConfiguration == null) return bundle;
            if (projectSettings.Folder == null || buildConfiguration.OutputFolderName == null) return bundle;
            var prgrm = Path.Combine(projectSettings.Folder, buildConfiguration.OutputFolderName,
                Path.GetFileNameWithoutExtension(projectSettings.StartupFile) + ".prg");
            buildConfiguration.ProgramFileName = prgrm;
            if (!File.Exists(prgrm))
                return bundle;
            return bundle;
        }
        protected abstract void LoadLabels(ProjectSettings projectSettings, AddressDataBundle bundle);



        public SourceCodeBundle LoadSource(ProjectSettings projectSettings)
        {
            if (projectSettings == null || projectSettings.Folder == null || projectSettings.StartupFile == null) return null;
            var prgrm = Path.Combine(projectSettings.Folder, projectSettings.StartupFile.Trim('\\').Trim('/'));
            var nullBundle = new SourceCodeBundle { Files = new List<SourceCodeFile>(), Name = "Unknown" };
            if (string.IsNullOrWhiteSpace(prgrm) || !File.Exists(prgrm))
                return nullBundle;
            
            // Create new bundle
            var sourceCodeBundle = new SourceCodeBundle
            {
                SourceFileName = prgrm,
                Name = Path.GetFileNameWithoutExtension(prgrm)
            };

            // Add root file
            InterpretFile(sourceCodeBundle, projectSettings, prgrm);
            sourceCodeBundle.Files = sourceCodeBundle.Files.OrderBy(x => x.IsBinary).ThenBy(x => x.FileName).ToList();
            return sourceCodeBundle;
        }

        
        protected abstract void InterpretFile(SourceCodeBundle sourceCodeBundle, ProjectSettings projectSettings, string prgrm);

        protected string FixFolderSlashes(string data)
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                return data.Replace("/", "\\");
            return data.Replace("\\", "/");
        }

        public AddressDataBundle ParseCompiledLabels(ProjectSettings projectSettings)
        {
            if (string.IsNullOrWhiteSpace(projectSettings.ReportFileName)) return null;
            var buildConfiguration = projectManager.GetBuildConfiguration(projectSettings);
            if (buildConfiguration == null) return null;
            var nullBundle = new AddressDataBundle { Name = "Unknown" };
            var outputFolder = buildConfiguration.OutputFolderName;
            var prgrm = Path.Combine(projectSettings.Folder, outputFolder, projectSettings.ReportFileName);
            if (string.IsNullOrWhiteSpace(prgrm) || !File.Exists(prgrm))
                return nullBundle;
            return LoadAddressData(projectSettings, prgrm);
        }
        protected abstract AddressDataBundle LoadAddressData(ProjectSettings projectSettings, string prgrm);

       


        protected SourceCodeFile GetFile(SourceCodeBundle sourceCodeBundle, ProjectSettings projectSettings, string fileName)
        {
            // Check if its a full fileName
            if (string.IsNullOrWhiteSpace(fileName)) return null;
            fileName = FixFolderSlashes(fileName);
            if (!fileName.Contains("/") && !fileName.Contains("\\"))
                fileName = Path.Combine(projectSettings.SourceCodeFolder, fileName.Trim('\\').Trim('/'));
            if (!fileName.Contains(projectSettings.Folder))
                fileName = Path.Combine(projectSettings.Folder, fileName.Trim('.').Trim('\\').Trim('/'));

            var sfile = sourceCodeBundle.Files.FirstOrDefault(item => item.FileNameFull == fileName);
            if (sfile != null)
                return sfile;

            var fileNameOnly = Path.GetFileName(fileName);
            var folder = Path.GetDirectoryName(fileName).Replace(projectSettings.Folder, "");
            var ext = Path.GetExtension(fileName);
            var isCodeFile = ext == ".a" || ext == ".asm";
            var isIncludeFile = ext == ".inc";
            var isBinary = ext == ".bin" || ext == "";
            sfile = new SourceCodeFile
            {
                FileNameFull = fileName,
                FileName = Path.Combine(folder.Trim('\\').Trim('/'), fileNameOnly),
                Folder = folder,
                IsCodeFile = isCodeFile,
                IsBinary = isBinary,
                IsIncludeFile = isIncludeFile,
            };
            sourceCodeBundle.Files.Add(sfile);
            return sfile;
        }


        public virtual void Save(SourceCodeBundle bundle)
        {
            if (isSaving) return;
            isSaving = true;
            try
            {
                foreach (var file in bundle.Files)
                {
                    if (file.IsBinary || !file.RequireSave) continue;
                    if (File.Exists(file.FileNameFull))
                    {
                        // Make a backup
                        var folderRoot = Path.GetDirectoryName(file.FileNameFull);
                        var backupFolder = Path.Combine(folderRoot, file.Folder, "AsmFun", "backup");
                        if (!Directory.Exists(backupFolder))
                            Directory.CreateDirectory(backupFolder);
                        var ext = Path.GetExtension(file.FileNameFull);
                        var backupFileName = Path.GetFileNameWithoutExtension(file.FileNameFull) + DateTime.Now.ToString("yyyyddmm_HHmmss") + ext;
                        var backupf = Path.Combine(backupFolder, backupFileName);
                        if (File.Exists(backupf))
                            File.Delete(backupf);
                        File.Copy(file.FileNameFull, backupf, true);
                        var sb = new StringBuilder();
                        if (file.Lines == null) continue;
                        foreach (var line in file.Lines)
                            sb.AppendLine(line.SourceCode);
                        File.Delete(file.FileNameFull);
                        File.WriteAllText(file.FileNameFull, sb.ToString());
                    }
                }
            }
            finally
            {
                isSaving = false;
            }

        }


       
        
    }
}
 
