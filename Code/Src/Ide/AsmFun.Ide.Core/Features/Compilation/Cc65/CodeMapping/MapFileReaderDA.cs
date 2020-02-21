using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace AsmFun.Ide.Core.Features.Compilation.Cc65.CodeMapping
{
    public class MapFileReaderDA
    {
        public List<Cc65File> Files { get; private set; }
        public List<Cc65Function> Functions { get; private set; }
        public List<Cc65Variable> Variables { get; private set; }
        private enum ReadSpace
        {
            Unknown,
            ModuleList,
            SegmentList,
            NameList,
            ByValueList,
            ImportList,
        }

        public void Read(string fileName)
        {
            var lines = File.ReadAllLines(fileName);
            Files = ParseFile(lines);
        }
        private List<Cc65File> ParseFile(string[] lines) { 
            ReadSpace currentSpace = ReadSpace.Unknown;
            Cc65File currentFile = new Cc65File();
            var files = new List<Cc65File>();
            var functions = new List<Cc65Function>();
            var vars = new List<Cc65Variable>();
            Functions = functions;
            Variables = vars;
            Cc65Variable currentVar = null;
            foreach (var line in lines)
            {
                if (line.StartsWith("--") || line == "" || (line.StartsWith("Name") && line.EndsWith("Align"))) continue;
                if (line.Contains(":") && !line.Contains(".o"))
                {
                    // possible space definition
                    if (line.Contains("Modules list")) currentSpace = ReadSpace.ModuleList;
                    else if (line.Contains("Segment list")) currentSpace = ReadSpace.SegmentList;
                    else if (line.Contains("list by name")) currentSpace = ReadSpace.NameList;
                    else if (line.Contains("list by value")) currentSpace = ReadSpace.ByValueList;
                    else if (line.Contains("Imports list")) currentSpace = ReadSpace.ImportList;
                    continue;
                }
                switch (currentSpace)
                {
                    case ReadSpace.Unknown:
                        continue;
                    case ReadSpace.ModuleList:
                        {
                            if (line.Contains(".o"))
                            {
                                var currentFileName = line.Trim().Trim(':');
                                currentFile = new Cc65File
                                {
                                    ObjectFileName = currentFileName,
                                    Functions = new List<Cc65Function>(),
                                };
                                files.Add(currentFile);
                                continue;
                            }
                            var function = CreateModule(line);
                            functions.Add(function);
                            currentFile.Functions.Add(function);
                        }
                        break;
                    case ReadSpace.SegmentList:
                        ParseSegment(functions, line);
                        break;
                    case ReadSpace.NameList:
                        CreateVariables(vars, line);
                        break;
                    case ReadSpace.ByValueList:
                        // Is the same
                        break;
                    case ReadSpace.ImportList:
                        currentVar = ParseVariables(currentVar,vars, line, files);
                        break;
                    default:
                        continue;
                }
            }
            return files;
        }

      

        private Cc65Function CreateModule(string line)
        {
            var module = new Cc65Function
            {
                Name = GetString(line, 4, 18),
                Offset = GetInt(line, 27, 6),
                Size = GetInt(line, 40, 6),
                Align = GetInt(line, 54, 5),
                Fill = GetInt(line, 66, 4),
            };
            return module;
        }

        private void ParseSegment(List<Cc65Function> functions, string line)
        {
            var name = GetString(line, 0, 22);
            var start = GetInt(line, 22, 6);
            var end = GetInt(line, 22, 6);
            var size = GetInt(line, 38, 6);
            var align = GetInt(line,46, 5);
            var functionSearch = functions.Where(x => x.Name == name ).ToList();
            if (!functionSearch.Any())
            {
                return;
            }
            if (functionSearch.Count > 1)
            {
                // damn
            }
            foreach (var function in functionSearch)
            {
                function.Start = start;
                function.End = end;
                function.TotalSize = size;
            }
            
        }

        private void CreateVariables(List<Cc65Variable> vars,string line)
        {
            var varName1 = GetString(line, 0, 26);
            var addName1 = GetInt(line, 26, 6);
            var addType1 = GetString(line, 33, 6);
            vars.Add(new Cc65Variable
            {
                Name = varName1,
                Address = addName1,
                Type = (Cc65VariableType)Enum.Parse(typeof(Cc65VariableType), addType1),
            });
            if (line.Length <= 40) return;
            var varName2 = GetString(line, 40, 26);
            var addName2 = GetInt(line, 66, 6);
            var addType2 = GetString(line, 73, 6);
            vars.Add(new Cc65Variable
            {
                Name = varName2,
                Address = addName2,
                Type = (Cc65VariableType)Enum.Parse(typeof(Cc65VariableType), addType2),
            });
        }

        private Cc65Variable ParseVariables(Cc65Variable currentVar, List<Cc65Variable> vars, string line, List<Cc65File> files)
        {
            if (!line.StartsWith("   "))
            {
                var varParts = line.Split('(');
                var varName = varParts[0].Trim();
                var objectFileName = varParts[1].Replace(":","").Trim().TrimEnd(')').Trim();
                currentVar = vars.First(item => item.Name == varName);
                var file = files.First(x => x.ObjectFileName == objectFileName);
                file.Variables.Add(currentVar);
                return currentVar;
            }
            var objFileName = GetString(line, 4, 25);
            var restLine = line.Substring(30).Split('(');
            var fileName = restLine[0];
            var lineNumber = restLine[1].Replace(")", "").Trim();
            var file2 = files.First(x => x.ObjectFileName == objFileName);
            file2.FileName = fileName;
            // Todo : add linenumber if needed
            file2.Variables.Add(currentVar);
            return currentVar;
        }


        private string GetString(string line, int start, int length)
        {
            var theValue = line.Substring(start, length).Trim();
            return theValue;
        }
        private int GetInt(string line, int start, int length)
        {
            var theValue = line.Substring(start, length).Trim();
            var valueInt = 0;
            int.TryParse(theValue, System.Globalization.NumberStyles.HexNumber,null, out valueInt);
            return valueInt;
        }
    }
}
