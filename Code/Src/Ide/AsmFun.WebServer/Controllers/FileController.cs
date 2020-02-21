using AsmFun.Ide.Common.Features.Files;
using AsmFun.Ide.Common.Features.Files.Data;
using Microsoft.AspNetCore.Mvc;

namespace AsmFun.WebServer.Controllers
{
    public class FileController : Controller
    {
        private readonly IFileManager fileManager;

        public FileController(IFileManager fileManager)
        {
            this.fileManager = fileManager;
        }

        [HttpGet]
        public string Ping()
        {
            return "Pong";
        }

        [HttpGet]
        public AsmFolder GetFiles(string folderName, string filter)
        {
            return fileManager.GetFiles(folderName, filter);
        }
    }
}
