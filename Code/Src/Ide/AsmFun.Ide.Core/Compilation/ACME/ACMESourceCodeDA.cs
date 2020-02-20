#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Ide.Common.Compilation.ACME;
using AsmFun.Ide.Common.Data;
using AsmFun.Ide.Common.Data.Programm;
using AsmFun.Ide.DataAccess;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace AsmFun.Ide.Core.Compilation.ACME
{
    public class ACMESourceCodeDA : SourceCodeDA, IACMESourceCodeDA
    {
        public ACMESourceCodeDA(IProjectManager projectManager) : base(projectManager)
        {
        }

        protected override void InterpretFile(SourceCodeBundle sourceCodeBundle, ProjectSettings projectSettings, string file)
        {
            var childFiles = new List<SourceCodeFile>();
            SourceCodeFile sfile = GetFile(sourceCodeBundle, projectSettings, file);
            if (sfile == null)
                return;
            sfile.Exists = File.Exists(file);

            // Check if it's a sourceCode file
            if (!sfile.IsCodeFile && !sfile.IsIncludeFile) return;

            if (sfile.HasBeenRead)
                return;

            if (!sfile.Exists) return;
            // Read the file.
            var txtLines = File.ReadAllLines(file);
            var lineNumber = 0;
            foreach (var txtLine in txtLines)
            {
                lineNumber++;

                // Find external files
                var matches = new Regex("\"([^\"]*)\"").Matches(txtLine);
                foreach (Match fileMatch in matches)
                {
                    var vari = fileMatch.Groups[1].Value;
                    if (vari.Contains(".bin") || txtLine.Contains("!binary") || vari.Contains(".inc") || txtLine.Contains("!src"))
                    {
                        var fileName = vari.Trim();
                        var childfile = GetFile(sourceCodeBundle, projectSettings, fileName);
                        if (childfile != null)
                            childFiles.Add(childfile);
                    }
                }
                var lineText = txtLine;
                var line = new SourceCodeLine
                {
                    LineNumber = lineNumber,
                    SourceCode = txtLine,
                };
                sfile.Lines.Add(line);
            }
            sfile.HasBeenRead = true;

            // we interpet all the new found child files.
            if (childFiles.Count > 0)
            {
                foreach (var childFile in childFiles)
                    InterpretFile(sourceCodeBundle, projectSettings, childFile.FileNameFull);
            }
        }

        protected override AddressDataBundle LoadAddressData(ProjectSettings projectSettings,string prgrm)
        {
            var txtLines = File.ReadAllLines(prgrm);
            var sourceCodeBundle = new AddressDataBundle
            {
                SourceFileName = prgrm,
                Name = Path.GetFileNameWithoutExtension(prgrm)
            };
            AddressDataFile sfile = null;
            foreach (var txtLine in txtLines)
            {
                if (string.IsNullOrWhiteSpace(txtLine)) continue;

                // ; ******** Source: xxxxxxx.asm
                if (txtLine.Contains("** Source:"))
                {
                    var fileName = txtLine.Replace("; ******** Source: ", "").Trim();
                    var fileNameOnly = Path.GetFileName(fileName);
                    var folder = fileName.Replace(fileNameOnly, "").Replace(projectSettings.Folder, "");
                    if (folder == "\\" || folder == "/") folder = "";
                    sfile = sourceCodeBundle.Files.FirstOrDefault(item => item.FileName == fileName);
                    if (sfile == null)
                    {
                        sfile = new AddressDataFile
                        {
                            FileName = fileNameOnly,
                            Folder = folder,
                        };
                        sourceCodeBundle.Files.Add(sfile);
                    }
                    continue;
                }
                if (txtLine.Length < 6) continue;
                // 6 chars are line number
                var lineText = txtLine.Substring(0, 6);
                var lineNumber = Convert.ToInt32(lineText);
                // 6 chars for the resulting memory address
                if (txtLine.Length < 6 + 7) continue;
                var resultMemoryAddress = txtLine.Substring(6, 6).ToUpper().Trim();
                if (resultMemoryAddress.Length == 0) continue;
                // 19 chars the byte value(s)
                if (txtLine.Length < 6 + 6 + 19) continue;
                var byteValue = txtLine.Substring(6 + 6, 20).ToUpper().Trim();
                var line = new AddressDataLine
                {
                    Line = lineNumber,
                    Address = resultMemoryAddress,
                    //ByteValues = byteValue
                };
                // Rest is original sourcecode text
                //if (txtLine.Length > 6 + 6 + 19)
                //    line.SourceCode = txtLine.Substring(6 + 6 + 20, txtLine.Length - (6 + 6 + 20));
                sfile.Lines.Add(line);
            }
            LoadLabels(projectSettings, sourceCodeBundle);
            return sourceCodeBundle;
        }

        protected override void LoadLabels(ProjectSettings projectSettings, AddressDataBundle bundle)
        {
            var buildConfiguration = projectManager.GetBuildConfiguration(projectSettings);
            if (buildConfiguration == null) return;
            var labelsFile = Path.Combine(projectSettings.Folder, buildConfiguration.OutputFolderName, projectSettings.LabelsFileName);
            if (File.Exists(labelsFile))
            {
                var labelsData = File.ReadAllLines(labelsFile);
                foreach (var labelRaw in labelsData)
                {
                    try
                    {
                        var labeld = labelRaw.Split(';')[0].Split('=');
                        if (labeld.Length < 2) continue;
                        var val = labeld[1].Trim().Replace("$", "");
                        if (val.Length == 1 || val.Length == 3 || val.Length == 5 || val.Length == 7)
                            val = "0" + val;
                        var valnum = int.Parse(val, System.Globalization.NumberStyles.HexNumber);

                        var label = new AddressDataLabel
                        {
                            Address = valnum,
                            Name = labeld[0].Trim(),
                        };
                        label.Length = 1;
                        bundle.Labels.Add(label);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Could not parse symbol :" + labelRaw + " : " + ex.Message);
                    }
                }
                bundle.Labels = bundle.Labels.OrderBy(x => x.Name).ToList();
            }
        }
   
      
    }
}
