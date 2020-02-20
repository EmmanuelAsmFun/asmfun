using AsmFun.Ide.Common.Data.Programm;
using AsmFun.Ide.Core.Compilation.Cc65.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace AsmFun.Ide.Core.Compilation.Cc65.CompiledParser
{
    internal class Cc65CompilitionParser
    {
        private List<CC65ParseFileContext> fileContexts = new List<CC65ParseFileContext>();
        private Cc65Config config;

        public Cc65CompilitionParser(Cc65Config config)
        {
            this.config = config;
        }

        public void Read(string[] txtLines, string filen, string folder)
        {
            
            var i = 0;
            var currentFileContext = new CC65ParseFileContext
            {
                FileName = filen,
                Folder = folder,
            };

            fileContexts = new List<CC65ParseFileContext>();
            var fileContextsStack = new Stack<CC65ParseFileContext>();
            fileContexts.Add(currentFileContext);
            fileContextsStack.Push(currentFileContext);
            var currentFileDepth = 1;
            Cc65Segment currentSegment = null;

            foreach (var txtLine in txtLines)
            {
                i++;
                if (string.IsNullOrWhiteSpace(txtLine)) continue;
                // - 8 chars address
                // - [SPACE]
                // - 2 CHARS file number
                // - [SPACE]
                // - 12 Data chars
                // - [SPACE]
                // - code
                if (txtLine.Length < 22 || i < 4) continue;
                //if (i == 172)
                //{

                //}
                var context = CreateLineContext(txtLine, currentSegment);
                if (currentFileDepth > context.FileDepth)
                {
                    fileContextsStack.Pop();
                    currentFileContext = fileContextsStack.Peek();
                    currentFileDepth = context.FileDepth;
                }
                context.FileContext = currentFileContext;

                // Increase line number
                context.FileContext.LastLineNumber++;
                context.LineNumber = context.FileContext.LastLineNumber;

                // 000000r 1.include "x16.inc"
                if (context.CodeChars.Contains(".include"))
                {
                    currentFileContext = ExtractInclude(context);
                    fileContextsStack.Push(currentFileContext);
                    currentFileDepth++;
                    continue;
                }

                // 00080D  1               .segment "STARTUP"
                if (context.CodeChars.Contains(".segment"))
                    currentSegment = ExtractSegment(context);

                // When there is no data bytes, there is no address to parse.
                if (context.DataChars == "")
                    continue;
                
                if (context.DataLength == 0)
                    continue;

                if (context.Segment != null)
                {
                    // If the new line has data, but not code, then it needs to be added on the previous line
                    if (context.CodeChars == "")
                    {
                        var exists = context.Segment.Lines.LastOrDefault();
                        if (exists != null)
                        {
                            exists.DataLength += context.DataLength;
                            exists.DataChars += " "+context.DataChars;
                            context.FileContext.LastLineNumber--;
                        }
                    }
                    else
                    {
                        context.Segment.Lines.Add(context);
                        // Valid line
                        context.FileContext.Lines.Add(context);
                    }
                }
            }
            //var resultProgram = "";

            foreach (var segment1 in config.Segments)
            {
                var address = segment1.Memory.StartNum;
                foreach (var line in segment1.Lines)
                {
                    //resultProgram += " " + line.DataChars;
                    var vall = 0;
                    var newAddress = address + vall;
                    var newAddress1 = segment1.Memory.StartNum + segment1.Memory.BytesWritten - 1;
                    var comp = newAddress - newAddress1;
                    if (line.Address != newAddress1)
                    {

                    }
                    
                    //line.Address = newAddress1;
                    //line.AddressString = newAddress1.ToString("X5");
                    segment1.Memory.BytesWritten += line.DataLength;
                }
            }
        }

        

        private CC65ParseLineContext CreateLineContext(string txtLine, Cc65Segment currentSegment)
        {
            var context = new CC65ParseLineContext
            {
                AddressString = txtLine.Substring(1, 5).Replace("r", "").Trim(),
                FileDepth = int.Parse(txtLine.Substring(8, 2).Trim()),
                DataChars = txtLine.Substring(11, 12).ToUpper().Trim(),
                CodeChars = txtLine.Substring(24, txtLine.Length - 24),
                Segment = currentSegment
            };
            context.DataLength = context.DataChars != ""? context.DataChars.Split(' ').Length: 0;
            context.Address = int.Parse(context.AddressString, System.Globalization.NumberStyles.HexNumber, null);
            return context;
        }

        private CC65ParseFileContext ExtractInclude(CC65ParseLineContext lineContext)
        {
            var fileName = lineContext.CodeChars.Replace(".include", "").Split(';')[0].Replace("\"", "").Trim();
            var fileContext = fileContexts.FirstOrDefault(item => item.FileName == fileName);
            if (fileContext == null)
            {
                fileContext = new CC65ParseFileContext
                {
                };
                fileContexts.Add(fileContext);
            }
            fileContext.FileName = fileName;
            return fileContext;
        }
        private Cc65Segment ExtractSegment(CC65ParseLineContext lineContext)
        {
            var segmentName = lineContext.CodeChars.Replace(".segment", "").Trim().Split(' ')[0].Replace("\"", "").Trim();
            lineContext.Segment = config.Segments.FirstOrDefault(item => item.Name == segmentName);
            return lineContext.Segment;
        }

        internal void Parse(AddressDataBundle sourceCodeBundle)
        {
            foreach (var fileContext in fileContexts)
            {
                var sfile = new AddressDataFile
                {
                    FileName = fileContext.FileName,
                    Folder = fileContext.Folder,
                };
                sourceCodeBundle.Files.Add(sfile);
                foreach (var line in fileContext.Lines)
                {
                    var lineSc = new AddressDataLine
                    {
                        Line = line.LineNumber,
                        Address = line.AddressString,
                    };
                    sfile.Lines.Add(lineSc);
                }
            }
           
        }
    }
}
