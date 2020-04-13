using AsmFun.Computer.Common.Processors;

namespace AsmFun.Computer.Common.Computer
{
    public interface IComputerDiagnose
    {
        void Step(ProcessorData processorData);
        void StepPaint(int frame, ushort y, byte[] pData);
        void WriteRAM(uint address, byte value);
    }
}
