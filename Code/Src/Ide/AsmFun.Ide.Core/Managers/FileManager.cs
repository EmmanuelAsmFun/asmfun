using AsmFun.Ide.Common.Data.FileExplorer;
using AsmFun.Ide.Common.DataAccess;
using AsmFun.Ide.Common.Managers;
using System.Globalization;
using System.IO;

namespace AsmFun.Ide.Core.Managers
{
    public class FileManager : IFileManager
    {
        private readonly IProjectManager projectManager;
        private readonly IUserSettingsDA userSettingsDA;

        public FileManager(IProjectManager projectManager, IUserSettingsDA userSettingsDA)
        {
            this.projectManager = projectManager;
            this.userSettingsDA = userSettingsDA;
        }

        public AsmFolder GetFiles(string folderName, string filter)
        {
            if (string.IsNullOrWhiteSpace(folderName) || !Directory.Exists(folderName))
            {
                var currentProject = projectManager.GetCurrentProjectSettings();
                if (currentProject != null && Directory.Exists(currentProject.Folder))
                {
                    folderName = currentProject.Folder;
                }
                else
                {
                    var userSettings = userSettingsDA.Load();
                    if (userSettings == null) return null;
                    folderName = userSettings.ProjectsFolder;
                }
            }
            folderName = folderName.Replace("\\", Path.DirectorySeparatorChar.ToString()).Replace("/", Path.DirectorySeparatorChar.ToString());
            var returnData = new AsmFolder
            {
                Folder = folderName.Replace("\\", "/"),
                Name = Path.GetFileName(Path.GetDirectoryName(folderName))
            };
            
            var dirFiles = Directory.GetFiles(folderName);
            foreach (var dirFile in dirFiles)
            {
                var file = GetFileInfo(dirFile);
                returnData.Files.Add(file);
            }
            var dirFolders = Directory.GetDirectories(folderName);
            foreach (var dirFolder in dirFolders)
            {
                var folder = GetFolderInfo(dirFolder);
                returnData.Folders.Add(folder);
            }
            return returnData;
        }

        public AsmFolder GetFolderInfo(string folder)
        {
            var asmFolder = new AsmFolder
            {
                Folder = folder.Replace("\\", "/"),
                Name= Path.GetFileName(folder),
            };
            return asmFolder;
        }

        public AsmFile GetFileInfo(string fileAndFolder)
        {
            var file = new FileInfo(fileAndFolder);
            var returnData = new AsmFile
            {
                Extension = Path.GetExtension(fileAndFolder),
                FileName = file.Name,
                Folder = file.Directory.FullName.Replace("\\","/"),
                FileSize = file.Length,
                Modified = file.LastWriteTime,
            };
            var format = CultureInfo.CurrentCulture;
            returnData.ModifiedString = returnData.Modified.ToString(format);
            // Remove seconds
            int index = returnData.ModifiedString.LastIndexOf(':');
            if (index > -1)
                returnData.ModifiedString = returnData.ModifiedString.Remove(index, 3);

            return returnData;
        }
    }
}
