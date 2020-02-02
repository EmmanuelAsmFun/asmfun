using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace AsmFun.Ide.Core.Compilation.Cc65.Configuration
{
    internal class Cc65ConfigReader
    {
        private string cc65FileName;
        private string configFolder;
        private string configFileName;

        public Cc65ConfigReader(string cc65FileName)
        {
            this.cc65FileName = cc65FileName;
            if (string.IsNullOrWhiteSpace(cc65FileName)) return;
            var dir = Directory.GetParent(Path.GetDirectoryName(cc65FileName)).FullName;
            configFolder = Path.Combine(dir, "cfg");
            configFileName = Path.Combine(configFolder, "cx16.cfg");
        }

        public Cc65Config Read()
        {
            var config = new Cc65Config();
            if (!string.IsNullOrWhiteSpace(configFileName) &&  File.Exists(configFileName))
            {
                var lines = File.ReadAllLines(configFileName);
                for (int i = 0; i < lines.Length; i++)
                {
                    string line = lines[i];
                    var lineParts = line.Trim().Split(' ');
                    if (line.IndexOf("{") > -1)
                    {
                        // new block
                        var blockName = lineParts[0];
                        switch (blockName)
                        {
                            case "FEATURES":
                                i = ParseFeatures(config, lines, i);
                                break;
                            case "SYMBOLS":
                                i = ParseSymbols(config, lines, i);
                                break; 
                            case "MEMORY":
                                i = ParseMemories(config, lines, i);
                                break; 
                            case "SEGMENTS":
                                i = ParseSegments(config, lines, i);
                                break;
                        }
                    }
                    

                }
            }
            return config;
        }
        private int ParseFeatures(Cc65Config config,string[] lines,int i)
        {
            var restLinesCount = lines.Length;
            i++;
            for (int j = i; j < restLinesCount; j++)
            {
                var line = lines[j].Trim();
                if (line == "}")
                    return i--;
                var lineParts = line.Split(' ');
                if (lineParts.Length < 2)
                {
                    i++;
                    continue;
                }
                var feature = new Cc65Feature
                {
                    Name = lineParts[0].Trim(':'),
                };
                var startLine = line;
                config.Features.Add(feature);
                var doBreak = false;
                for (int k = j; k < restLinesCount; k++)
                {
                    line = lines[k].Trim();
                    if (line == "}")
                        return i--;
                    var parameters = CleanParams(line, lineParts[0]);
                    foreach (var parameter in parameters)
                    {
                        var paraParts = parameter.Trim().Split('=');
                        if (paraParts.Length < 2) continue;
                        switch (paraParts[0].Trim())
                        {
                            case "default":
                                feature.StartAddress = CleanVal(paraParts[1]);
                                feature.StartAddressNum = ReplaceVars(config, feature.StartAddress);
                                break;
                            case "type": feature.Type = CleanVal(paraParts[1]); break;
                            case "count": feature.Count = CleanVal(paraParts[1]); break;
                            case "segment":
                                feature.SegmentName = CleanVal(paraParts[1]);
                                feature.Segment = config.Segments.FirstOrDefault(item => item.Name == feature.SegmentName);
                                break;
                        }
                        if (line.Contains("CONDES") && startLine != line)
                        {
                            doBreak = true;
                            break;
                        }
                    }
                    if (doBreak)
                        break;
                    i++;
                    
                }
                
            }
            return i;
        }

        private int ParseSymbols(Cc65Config config, string[] lines, int i)
        {
            var restLinesCount = lines.Length;
            i++;
            for (int j = i; j < restLinesCount; j++)
            {
                var line = lines[j].Trim();
                if (line == "}")
                    return i--;
                var lineParts = line.Split(' ');
                if (lineParts.Length < 2)
                {
                    i++;
                    continue;
                }

                var data = new Cc65Symbol
                {
                    Name = lineParts[0].Trim(':'),
                };
                config.Symbols.Add(data);
                var parameters = CleanParams(line, lineParts[0]);
                foreach (var parameter in parameters)
                {
                    var paraParts = parameter.Trim().Split('=');
                    if (paraParts.Length < 2) continue;
                    switch (paraParts[0].Trim())
                    {
                        case "type":
                            data.Type = CleanVal(paraParts[1]);
                            break;
                        case "value":
                            data.Value = CleanVal(paraParts[1]);
                            data.ValueNum = ReplaceVars(config, data.Value);
                            break;
                    }

                }
                i++;
            }
            return i;
        }

        private int ParseMemories(Cc65Config config,string[] lines,int i)
        {
            var restLinesCount = lines.Length;
            i++;
            for (int j = i; j < restLinesCount; j++)
            {
                var line = lines[j].Trim();
                if (line == "}")
                    return i--;
                var lineParts = line.Split(' ');
                if (lineParts.Length < 2)
                {
                    i++;
                    continue;
                }
                
                var data = new Cc65Memory
                {
                    Name = lineParts[0].Trim(':'),
                };
                config.Memories.Add(data);
                var parameters = CleanParams(line, lineParts[0]);
                foreach (var parameter in parameters)
                {
                    var paraParts = parameter.Trim().Split('=');
                    if (paraParts.Length < 2) continue;
                    switch (paraParts[0].Trim())
                    {
                        case "file":
                            data.File = CleanVal(paraParts[1]);
                            break;
                        case "define":
                            data.Define = VarToBoolean(paraParts[1]);
                            break;
                        case "start":
                            {
                                data.Start = CleanVal(paraParts[1]);
                                data.StartNum = ReplaceVars(config, data.Start);
                                break;
                            }
                        case "size":
                            {
                                data.Size = CleanVal(paraParts[1]);
                                var result = ReplaceVars(config,data.Size);
                                data.SizeNum = ReplaceVars(config, data.Size);
                                break;
                            }
                    }

                }
                i++;
            }
            return i;
        }

        public int ReplaceVars(Cc65Config config, string data)
        {
            //var resultValuesStr = new List<string>();
            var resultValues = new List<int>();
            var parts = data.Split('-');
            foreach (var part in parts)
            {
                var cleanElement = CleanVal(part);
                if (cleanElement[0] == '$')
                {
                   // resultValuesStr.Add(cleanElement);
                    var add = 0;
                    if (int.TryParse(cleanElement.Replace("$",""), System.Globalization.NumberStyles.HexNumber, null, out add))
                        resultValues.Add(add);
                }
                else if (cleanElement == "%S")
                {
                    var feature = config.Features.FirstOrDefault(item => item.Name == "STARTADDRESS");
                    if (feature != null)
                    {
                        var add = 0;
                        resultValues.Add(feature.StartAddressNum);
                    }
                }
                else if (cleanElement == "__HEADER_LAST__")
                {
                    var header = config.Memories.FirstOrDefault(item => item.Name == "HEADER");
                    if (header != null)
                    {
                        var lastHeader = header.StartNum + header.SizeNum;
                        resultValues.Add(lastHeader);
                    }
                }
                else
                {
                    var symbol = config.Symbols.FirstOrDefault(item => item.Name == part.Trim());
                    if (symbol != null)
                    {
                        resultValues.Add(symbol.ValueNum);
                        //resultValuesStr.Add(myValue);
                    }
                    else
                    {
                        var add = 0;
                        if (int.TryParse(cleanElement, System.Globalization.NumberStyles.HexNumber, null, out add))
                            resultValues.Add(add);
                    }
                }
            }
            if (resultValues.Count == 0)
                return -1;
            var sum = resultValues.Aggregate((a,b) => a - b);
            return sum;
        }

        private int ParseSegments(Cc65Config config, string[] lines, int i)
        {
            var restLinesCount = lines.Length;
            i++;
            for (int j = i; j < restLinesCount; j++)
            {
                var line = lines[j].Trim();
                if (line == "}")
                    return i--;
                var lineParts = line.Split(' ');
                if (lineParts.Length < 2)
                {
                    i++;
                    continue;
                }

                var data = new Cc65Segment
                {
                    Name = lineParts[0].Trim(':'),
                };
                config.Segments.Add(data);
                var parameters = CleanParams(line, lineParts[0]);
                foreach (var parameter in parameters)
                {
                    var paraParts = parameter.Trim().Split('=');
                    if (paraParts.Length < 2) continue;
                    switch (paraParts[0].Trim())
                    {
                        case "load":
                            data.Load = CleanVal(paraParts[1]);
                            data.Memory = config.Memories.FirstOrDefault(item => item.Name == data.Load);
                            break;
                        case "type":
                            data.Type = CleanVal(paraParts[1]);
                            break;
                        case "define":
                            data.Define = VarToBoolean(paraParts[1]);
                            break; 
                        case "optional":
                            data.Optional = VarToBoolean(paraParts[1]);
                            break;
                    }

                }
                i++;
            }
            return i;
        }


        private string[] CleanParams(string data,string replace)
        {
            return data.Replace(replace, "").Split('#')[0].Trim().Split(',');
        } 
        private string CleanVal(string data)
        {
            return data.Trim().Split('#')[0].Trim().Trim(';').Trim();
        }
        private bool VarToBoolean(string data)
        {
            return data.Trim().Replace("$", "").Split('#')[0].Trim().Trim(';').Trim() == "yes";
        }
    }
}
