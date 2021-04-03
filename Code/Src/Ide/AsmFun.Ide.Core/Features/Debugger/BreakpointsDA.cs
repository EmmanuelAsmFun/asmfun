using AsmFun.Common.DataAccess;
using AsmFun.Computer.Common.Debugger;
using AsmFun.Ide.Common.Features.Projects;
using System.IO;

namespace AsmFun.Ide.Core.Features.Debugger
{
    public class BreakpointsDA : IBreakpointsDA
    {
        public const string FileName = "Breakpoints.json";
        private readonly IAsmJSonSerializer serializer;
        private readonly IProjectManager projectManager;

        public BreakpointsDA(IAsmJSonSerializer serializer, IProjectManager projectManager)
        {
            this.serializer = serializer;
            this.projectManager = projectManager;
        }

        public DebuggerData Load()
        {
            var fileName = GetFileName();
            if (string.IsNullOrWhiteSpace(fileName) || !File.Exists(fileName)) return new DebuggerData();
            var data = serializer.DeserializeFile<DebuggerData>(fileName);
            return data;
        }
        public void Save(DebuggerData data)
        {
            var fileName = GetFileName();
            if (string.IsNullOrWhiteSpace(fileName)) return;
            if (File.Exists(fileName))
                File.Delete(fileName);
            serializer.SerializeFile(fileName, data);
        }

        private string GetFileName()
        {
            var projectSettings = projectManager.GetCurrentProjectSettings();
            if (projectSettings == null || string.IsNullOrWhiteSpace(projectSettings.Folder)) return null;
            var path = Path.Combine(projectSettings.Folder, "AsmFun");
            var fileName = Path.Combine(path, FileName);
            return fileName;
        }
    }
}
