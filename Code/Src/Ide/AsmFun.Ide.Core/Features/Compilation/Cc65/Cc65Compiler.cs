#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Ide.Common.Features.Compilation;
using AsmFun.Ide.Common.Features.Compilation.Cc65;
using AsmFun.Ide.Common.Features.Projects;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;

namespace AsmFun.Ide.Core.Features.Compilation.Cc65
{
    public class Cc65Compiler : BaseCompiler<Cc65CompilerSettings>, ICc65Compiler
    {
        public Cc65Compiler(ProjectSettings projectSettings, Cc65CompilerSettings compilerSettings) : base(projectSettings, compilerSettings)
        {
        }

        public override CompilaterResult Compile(BuildConfiguration configuration)
        {
            if (projectSettings == null || string.IsNullOrWhiteSpace(compilerSettings.Cc65FileName)) return new CompilaterResult();
            var compilerFileName = compilerSettings.Cc65FileName;
            var fileNameClean = projectSettings.StartupFile.Trim('\\').Trim('/');
            var folderClean = projectSettings.Detail.FullFolderName.Trim('\\').TrimEnd('/');
            var startFileName = projectSettings.Detail != null ? Path.Combine(folderClean, fileNameClean) : "";
            if (string.IsNullOrWhiteSpace(startFileName))
                return new CompilaterResult
                {
                    RawText = "No start file",
                    ErrorText = "No start file",
                     HasErrors = true,
                };
            if (!File.Exists(startFileName)) return new CompilaterResult
            {
                RawText = "No start file found",
                ErrorText = "No start file found",
                HasErrors = true,
            };
            if (!File.Exists(compilerFileName)) return new CompilaterResult
            {
                RawText = "Compiler Cc65 found",
                ErrorText = "Compiler Cc65 found: " + compilerFileName,
                HasErrors = true,
            };
            var subFolder = fileNameClean.Replace(Path.GetFileName(fileNameClean), "").Trim('\\').TrimEnd('/');

            var tempFn = "tempppppppp.asm";
            var tempMainFile = Path.Combine(projectSettings.Folder, subFolder, tempFn);
            var outputFolder = Path.Combine(projectSettings.Folder, configuration.OutputFolderName);
            //if (!Directory.Exists(outputFolder))
            Directory.CreateDirectory(outputFolder);

            // make a copy of the original file
            File.Copy(startFileName, tempMainFile, true);
            var addonFolders = new List<string>();
            if (!string.IsNullOrWhiteSpace(projectSettings.Detail.AddonBuildFolders))
                addonFolders = new List<string>(projectSettings.Detail.AddonBuildFolders.Split(','));
            // Add root folder
            addonFolders.Add("");
            try
            {

                string[] arrLine = File.ReadAllLines(tempMainFile);
                if (arrLine.Length >= 5)
                {
                    /// Remove outputfilenames and symbollist
                    for (int i = 0; i < 5; i++)
                    {
                        if (arrLine[i].StartsWith("!to"))
                            arrLine[i] = "";
                        else if (arrLine[i].StartsWith("!symbollist")) arrLine[i] = "";
                    }
                    File.WriteAllLines(tempMainFile, arrLine);
                }
                var fileNameStart = Path.GetFileName(startFileName);
                var fileName = Path.GetFileNameWithoutExtension(startFileName);
                var buildFolder = Path.Combine(projectSettings.Folder, outputFolder);
                if (!Directory.Exists(buildFolder)) Directory.CreateDirectory(buildFolder);
                if (string.IsNullOrWhiteSpace(configuration.CompilerVariables)) configuration.CompilerVariables = "";
                var commandLine = $" -v --cpu 65C02 {configuration.CompilerVariables} " +
                    $"-l {buildFolder}/{projectSettings.ReportFileName} -g -d -T " +
                    $"-Ln {buildFolder}/{projectSettings.LabelsFileName} " +
                    $"-o {buildFolder}/{fileName}.prg " +
                    $"-m {buildFolder}/{fileName}.lst "; // Create an assembler listing file
                //foreach (var addonFolder in addonFolders)
                //    commandLine += "-I " + Path.Combine(projectSettings.Folder, addonFolder.Trim('\\').Trim('/').Trim()) + " ";
                commandLine +=
                    $" {tempMainFile} ";
                var fullCommandLine = "\"" + compilerFileName + "\" " + commandLine;
                var proc = new Process
                {
                    StartInfo = new ProcessStartInfo
                    {
                        FileName = compilerFileName,
                        Arguments = commandLine,
                        UseShellExecute = false,
                        RedirectStandardOutput = true,
                        RedirectStandardError = true,
                        CreateNoWindow = true
                    }
                };
                string result = fullCommandLine + System.Environment.NewLine + System.Environment.NewLine;
                proc.Start();
                proc.WaitForExit();
                result += proc.StandardOutput.ReadToEnd() + System.Environment.NewLine + System.Environment.NewLine;
                var errors = proc.StandardError.ReadToEnd().Replace(tempFn, fileNameStart);
                result = result.Replace(tempFn, fileNameStart);
                var resultC = new CompilaterResult
                {
                    RawText = result,
                    ErrorText = errors,
                    HasErrors = errors.Length > 0,
                };
                // cleanup report file
                var repFile = Path.Combine(buildFolder, projectSettings.ReportFileName);
                if (File.Exists(repFile))
                {
                    var repText = File.ReadAllText(repFile);
                    repText = repText.Replace(tempFn, fileNameStart);
                    File.Delete(repFile);
                    File.WriteAllText(repFile, repText);
                }
                return resultC;
            }
            finally
            {
                File.Delete(tempMainFile);
            }
        }

       
    }
}
