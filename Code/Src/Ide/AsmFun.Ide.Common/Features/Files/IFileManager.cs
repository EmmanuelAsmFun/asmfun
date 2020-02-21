
using AsmFun.Ide.Common.Features.Files.Data;

namespace AsmFun.Ide.Common.Features.Files
{
    public interface IFileManager
    {
        AsmFolder GetFiles(string folderName , string filter);
        AsmFile GetFileInfo(string fileAndFolder);
    }
}
