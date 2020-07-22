using AsmFun.Computer.Common.Processors;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace AsmFun.Computer.Core.Debugger
{
    public interface IDataLogger
    {
        void ProcessorStep(string opcodeName);
        void SetOutputFile(string fileAndPath);
    }
    public class DataLogger : IDataLogger
    {
        private readonly ProcessorData processorData;
        private string fileAndPath;
        private bool wait;
        private bool isSaving;
        private Queue<string> datas = new Queue<string>();

        public DataLogger(ProcessorData processorData)
        {
            this.processorData = processorData;
            fileAndPath = "c:\\temp\\CommanderX16Log.csv";
        }

        public void ProcessorStep(string opcodeName)
        {
            var data =
                $"{processorData.instructionsCount.ToString("X2")}\t{processorData.ProgramCounter.ToString("X2")}\t{processorData.StackPointer.ToString("X2")}\t{opcodeName}\t{processorData.A.ToString("X2")}\t{processorData.X.ToString("X2")}\t{processorData.Y.ToString("X2")}\t{processorData.Status.ToString("X2")}";
            while (wait) { }
            while (wait) { }
            datas.Enqueue(data);
            if (datas.Count == 10000)
                Task.Run(() => SaveToFile());
        }
        private void SaveToFile()
        {
            try
            {
                while (isSaving) { }
                isSaving = true;
                try
                {
                    string[] copy;
                    wait = true;
                    copy = datas.ToArray();
                    datas.Clear();
                    wait = false;
                    File.AppendAllLines(fileAndPath, copy);
                }
                finally
                {
                    isSaving = false;
                }
            }
            catch (System.Exception)
            {
            }
        }

        public void SetOutputFile(string fileAndPath)
        {
            this.fileAndPath = fileAndPath;
        }
    }
}
