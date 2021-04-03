namespace AsmFun.Computer.Common.Debugger
{
    public interface IBreakpointsDA
    {
        DebuggerData Load();
        void Save(DebuggerData data);
    }
}
