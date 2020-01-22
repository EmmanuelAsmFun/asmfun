using AsmFun.Ide.Common.Data.FileExplorer;

namespace AsmFun.Ide.Common.Managers
{
    public interface IFileManager
    {
        AsmFolder GetFiles(string folderName , string filter);
        AsmFile GetFileInfo(string fileAndFolder);
    }
}
