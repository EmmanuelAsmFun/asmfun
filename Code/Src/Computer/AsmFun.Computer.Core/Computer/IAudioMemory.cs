using System;

namespace AsmFun.Computer.Core.Computer
{
    public interface IAudioMemory
    {
        void SetWriteAudioMethod(Action<int, int> writeAudio);
    }
}
