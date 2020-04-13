namespace AsmFun.Computer.Common
{
    public interface IAudioPlayer
    {
        bool IsEnabled { get; set; }

        void Render(int cpu_clocks);
    }
}
