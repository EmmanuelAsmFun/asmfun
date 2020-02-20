#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common;
using AsmFun.Core.Tools;
using AsmFun.Ide.Common.Compilation.Cc65;
using AsmFun.Ide.Common.Data;
using AsmFun.Ide.Common.Data.Programm;
using AsmFun.Ide.Core.Compilation.Cc65.CodeMapping;
using AsmFun.Ide.Core.Compilation.Cc65.CompiledParser;
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

        
        protected override AddressDataBundle LoadAddressData(ProjectSettings projectSettings, string prgrm)
        {
            var txtLines = File.ReadAllLines(prgrm);
            var sourceCodeBundle = new AddressDataBundle
            {
                SourceFileName = prgrm,
                Name = Path.GetFileNameWithoutExtension(prgrm)
            };
           
            if (txtLines.Length < 4) return sourceCodeBundle;
            var config = new Cc65ConfigReader(compilerSettings.Cc65FileName).Read();

            var filen = txtLines[2].Replace("Current file:", "").Trim();
            var folder = Path.GetDirectoryName(filen).Replace(projectSettings.Folder, "");
            var filenOnly = Path.GetFileName(filen);

            var parser = new Cc65CompilitionParser(config);
            parser.Read(txtLines, filenOnly, folder);
            parser.Parse(sourceCodeBundle);
            

            //var cleanPrgrm = resultProgram.Replace("  "," ").Replace("  ", " ").Replace("RR","00");
            //var bytes = AsmTools.StringToByteArray("00000000000000000000000000"+cleanPrgrm.Replace(" ", ""));
            //File.WriteAllBytes(@"c:\Temp\testPrg.bin",bytes);
            
            LoadLabels(projectSettings, sourceCodeBundle);
            return sourceCodeBundle;
        }
       


        protected override void LoadLabels(ProjectSettings projectSettings, AddressDataBundle bundle)
        {
            var buildConfiguration = projectManager.GetBuildConfiguration(projectSettings);
            if (buildConfiguration == null) return;
            var labelsFile = Path.Combine(projectSettings.Folder, buildConfiguration.OutputFolderName, projectSettings.LabelsFileName);
            if (!File.Exists(labelsFile)) return;
            var symbolDA = new Cc65SymbolsDA();
            symbolDA.Read(labelsFile);
            bundle.Labels = symbolDA.GetAll().Select(x => new AddressDataLabel
            {
                Name = x.Name,
                Address = x.Address,
                Length = x.Length
            }).ToList();
        }

      
    }
}

