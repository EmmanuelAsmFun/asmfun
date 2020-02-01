#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common;
using AsmFun.Common.Ide.Data.Programm;
using AsmFun.Core.Tools;
using AsmFun.Ide.Common.Compilation.Cc65;
using AsmFun.Ide.Common.Data;
using AsmFun.Ide.Common.Data.Programm;
using AsmFun.Ide.Core.Compilation.Cc65.Configuration;
using AsmFun.Ide.DataAccess;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace AsmFun.Ide.Core.Compilation.Cc65
{
    public class Cc65SourceCodeDA : SourceCodeDA , ICc65SourceCodeDA
    {
        private SourceCodeBundle lastSourceCodeBundle;
        private readonly Cc65CompilerSettings compilerSettings;

        public Cc65SourceCodeDA(IProjectManager projectManager, Cc65CompilerSettings compilerSettings) : base(projectManager)
        {
            this.compilerSettings = compilerSettings;
        }

        protected override void InterpretFile(SourceCodeBundle sourceCodeBundle, ProjectSettings projectSettings, string file)
        {
            lastSourceCodeBundle = sourceCodeBundle;
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
                    if (vari.Contains(".bin") || txtLine.Contains("!binary") || vari.Contains(".inc") || txtLine.Contains("!src") || txtLine.Contains(".asm"))
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
                    RawContent = txtLine,
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

        protected override SourceCodeBundle LoadSourceByCompiled(ProjectSettings projectSettings, string prgrm)
        {
            var txtLines = File.ReadAllLines(prgrm);
            var sourceCodeBundle = new SourceCodeBundle
            {
                SourceFileName = prgrm,
                Name = Path.GetFileNameWithoutExtension(prgrm)
            };
            SourceCodeFile sfile = null;
            if (txtLines.Length < 4) return sourceCodeBundle;
            var config = new Cc65ConfigReader(compilerSettings.Cc65FileName).Read();

            var filen = txtLines[2].Replace("Current file:", "").Trim();
            var folder = Path.GetDirectoryName(filen).Replace(projectSettings.Folder, "");
            sfile = new SourceCodeFile
            {
                FileNameFull = filen,
                FileName = Path.GetFileName(filen),
                Exists = File.Exists(filen),
                IsCodeFile = true,
                Folder = folder,
            };
            sourceCodeBundle.Files.Add(sfile);
            var i = 0;
            var lineNumber = 0;
            Cc65Segment segment = null;
            var lineNumberByFile = new List<int>();
            var lastFileNumber = 1;
            foreach (var txtLine in txtLines)
            {
                i++;
                if (string.IsNullOrWhiteSpace(txtLine)) continue;
                // - 8 chars address
                // - [SPACE]
                // - 2 CHARS ???
                // - [SPACE]
                // - 12 Data chars
                // - [SPACE]
                // - code
                if (txtLine.Length < 22 || i < 4) continue;
                if (i == 172)
                {

                }
                var address = txtLine.Substring(0, 7);
                var fileNumber = int.Parse(txtLine.Substring(8, 2).Trim());
                var dataChars = txtLine.Substring(11, 12).ToUpper().Trim();
                var codeChars = txtLine.Substring(24, txtLine.Length - 24);
                if (lastFileNumber != fileNumber)
                {
                    // File change
                    if (lineNumberByFile.Count >= fileNumber )
                        lineNumber = lineNumberByFile[fileNumber - 1];
                    lastFileNumber = fileNumber;
                }

                // 000000r 1.include "x16.inc"
                if (codeChars.Contains(".include"))
                {
                    lineNumberByFile.Add(lineNumber);
                    lineNumber = 0;
                    var fileName = codeChars.Replace(".include", "").Split(';')[0].Replace("\"", "").Trim();
                    sfile = GetFile(sourceCodeBundle, projectSettings, fileName);
                    continue;
                }
                if (codeChars.Contains(".segment")) 
                {
                    var segmentName = codeChars.Replace(".segment", "").Trim().Split(' ')[0].Replace("\"", "").Trim();
                    segment = config.Segments.FirstOrDefault(item => item.Name == segmentName);
                }
                lineNumber++;
                var resultMemoryAddress = address.Replace("r", "");
                if (dataChars == "")
                {
                    resultMemoryAddress = "";
                    continue;
                }
                var dataLength = dataChars.Split(' ').Length;
                if (dataLength == 0)
                    continue;
                var line = new SourceCodeLine
                {
                    LineNumber = lineNumber + 1,
                    //RawContent = txtLine,
                    ResultMemoryAddress = resultMemoryAddress,
                    ByteValues = dataChars+" ",
                    DataLength = dataLength,
                };
                if (segment != null)
                {
                    // If the new line has data, but not code, then it needs to be added on the previous line
                    if (codeChars == "")
                    {
                        var exists = segment.Lines.LastOrDefault();
                        if (exists != null)
                        {
                            exists.DataLength += line.DataLength;
                            exists.ByteValues += line.ByteValues;
                            lineNumber--;
                        }
                        else
                        {

                        }
                    }
                    else
                    {
                        segment.Lines.Add(line);
                        
                        sfile = sourceCodeBundle.Files[fileNumber - 1];
                        if (sfile == null) continue;
                        sfile.Lines.Add(line);
                    }
                }
            }
            var resultProgram = "";
            
            foreach (var segment1 in config.Segments)
            {
                var address = segment1.Memory.StartNum;
                foreach (var line in segment1.Lines)
                {
                    resultProgram += line.ByteValues;
                    var vall = 0;
                    if (int.TryParse(line.ResultMemoryAddress,System.Globalization.NumberStyles.HexNumber,null, out vall))
                    {
                        var newAddress = address + vall;
                        var comp = newAddress - (segment1.Memory.StartNum + segment1.Memory.BytesWritten);
                        if (comp != 0)
                        {

                        }
                        var newAddress1 = segment1.Memory.StartNum + segment1.Memory.BytesWritten;
                        line.ResultMemoryAddress = newAddress1.ToString("X4");
                        segment1.Memory.BytesWritten += line.DataLength;
                    }
                }
            }

            //var cleanPrgrm = resultProgram.Replace("  "," ").Replace("  ", " ").Replace("RR","00");
            //var bytes = AsmTools.StringToByteArray("00000000000000000000000000"+cleanPrgrm.Replace(" ", ""));
            //File.WriteAllBytes(@"c:\Temp\testPrg.bin",bytes);
            sfile.HasBeenRead = true;
            LoadLabels(projectSettings, sourceCodeBundle);
            return sourceCodeBundle;
        }

        protected override void LoadLabels(ProjectSettings projectSettings, SourceCodeBundle bundle)
        {
            var buildConfiguration = projectManager.GetBuildConfiguration(projectSettings);
            if (buildConfiguration == null) return;
            var labelsFile = Path.Combine(projectSettings.Folder, buildConfiguration.OutputFolderName, projectSettings.LabelsFileName);
            if (!File.Exists(labelsFile)) return;
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
                    int valnum = 0;
                    int.TryParse(val, System.Globalization.NumberStyles.HexNumber,null,out valnum);

                    var label = new SourceCodeLabel
                    {
                        Address = valnum,
                        Name = labeld[0].Trim(),
                    };
                    label.VariableLength = 1;
                    //// Check if its a zone
                    //foreach (var file in bundle.Files)
                    //{
                    //    foreach (var line in file.Lines)
                    //    {
                    //        if (line.RawContent.Contains(label.Name + ":"))
                    //            label.IsZone = true;
                    //        else
                    //        {

                    //        }
                    //    }
                    //}
                    bundle.Labels.Add(label);
                }
                catch (Exception ex)
                {
                    ConsoleHelper.WriteError<Cc65SourceCodeDA>(ex,"Could not parse symbol :" + labelRaw + " : " + ex.Message);
                }
            }
            bundle.Labels = bundle.Labels.OrderBy(x => x.Name).ToList();
        }

      
    }
}

