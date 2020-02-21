#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Ide.Common.Features.Projects;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Text.RegularExpressions;
using System.Xml;

namespace AsmFun.Ide.Core.Features.SourceCode
{
    public class GitHubDataAccess
    {
        public void Load(string projectFolder, ProjectDetail projectDetail)
        {
            var url = projectDetail.InternetSource;
            string sourceData = "";
#if DEBUG
            //var tempFile = @"c:\temp\github.html";
            //if (File.Exists(tempFile))
            //    sourceData = File.ReadAllText(tempFile);
            //else
           // {
#endif
                if (!string.IsNullOrWhiteSpace(projectDetail.InternetVersion))
                {
                    if (url.IndexOf("tree/master/") > -1)
                    {
                        url = url.Replace("tree/master/", "tree/" + projectDetail.InternetVersion+"/");
                    }
                    else
                        url += "/tree/" + projectDetail.InternetVersion;
                }
                sourceData = Download(url);
                if (string.IsNullOrWhiteSpace(sourceData)) return;
#if DEBUG
            //    if (File.Exists(tempFile)) File.Delete(tempFile);
            //    //File.WriteAllText(tempFile, sourceData);
            //}
#endif
            Download(projectFolder, sourceData, projectDetail.InternetVersion);
        }

        private void Download(string projectFolder, string htmlData,string internetVersion)
        {
            if (string.IsNullOrWhiteSpace(internetVersion)) internetVersion = "master";
            var files = new List<string>();
            var directories = new List<string>();
            var regExBlock = new Regex("(<tr class=\"js-navigation-item\")([\\s\\S]*?)(<\\/tr>)");
            var regEx = new Regex("(<a class=\"js-navigation-open\").*(href=\")([^\"]*)");
            var matchesBlock = regExBlock.Matches(htmlData);
            foreach (Match matchBlock in matchesBlock)
            {
                var isDirectory = false;
                var innerText = matchBlock.Groups[2].Value;
                if (innerText.Contains("aria-label=\"directory\""))
                    isDirectory = true;
                var matches = regEx.Matches(innerText);
                foreach (Match match in matches)
                {
                    if (isDirectory)
                        directories.Add(match.Groups[3].Value);
                    else
                        files.Add(match.Groups[3].Value);
                }
            }

            foreach (var file in files)
            {
                var fileMaster = file.Replace("/blob", "");
                var ext = Path.GetExtension(fileMaster);
                var onlineUrl = "https://raw.githubusercontent.com" + fileMaster;
                var fileParts = fileMaster.Split('/');
                var fileNameOnly = fileParts[fileParts.Length - 1];
                var fileName = Path.Combine(projectFolder, fileNameOnly);
                var isBinary = ext == ".jpg" || ext == ".jpeg" || ext == ".gif" || ext == ".png" || ext == "" || ext == ".svg"
                    || ext == ".pal" || ext == ".data" || ext == ".bin";
                try
                {
                    if (File.Exists(fileName)) File.Delete(fileName);
                    if (isBinary)
                    {
                        onlineUrl = "https://github.com" + fileMaster.Replace(internetVersion, "raw/"+ internetVersion);
                        var fileData = DownloadBinary(onlineUrl);
                        File.WriteAllBytes(fileName, fileData);
                    }
                    else
                    {
                        var fileData = Download(onlineUrl);
                        File.WriteAllText(fileName, fileData);
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine("Error downloading:" + fileNameOnly+":"+e.Message);
                }
            }
            foreach (var dir in directories)
            {
                var dirParts = dir.Split('/');
                var dirName = dirParts[dirParts.Length - 1];
                var directory = Path.Combine(projectFolder, dirName);
                var childSource = Download("https://github.com"+dir);
                if (string.IsNullOrWhiteSpace(childSource)) continue;
                if (!Directory.Exists(directory)) Directory.CreateDirectory(directory);
                Download(directory, childSource, internetVersion);
            }
        }

        private string Download(string url)
        {
            using (var client = new WebClient())
            {
                client.Headers.Add("Referer", url);
                client.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36");
                var sourceData = client.DownloadString(url);
                return sourceData;
            }
        } 
        private byte[] DownloadBinary(string url)
        {
            using (var client = new WebClient())
            {
                client.Headers.Add("Referer", url);
                client.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36");
                var sourceData = client.DownloadData(url);
                return sourceData;
            }
        }
    }
}
