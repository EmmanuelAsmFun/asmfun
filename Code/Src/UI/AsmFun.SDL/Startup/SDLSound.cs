using AsmFun.Computer.Core.Sound.Yamaha2151;
using System;
using System.Runtime.InteropServices;

namespace AsmFun.Startup
{
    public class SDLSound : IDisposable
    {
        private bool isStopped;
        string audio_dev_name ;
        /// <summary>
        /// refers to SDL_AudioDeviceID
        /// </summary>
        uint audio_dev = 0;
        private SDL2.SDL.SDL_AudioSpec want;
        private SDL2.SDL.SDL_AudioSpec have;
        private ushort AUDIO_SAMPLES = 1024; // 1024;// 4096 // 256
        private int SAMPLERATE = 22050;

        private Ym2151 ym2151;

        public SDLSound()
        {
            ym2151 = new Ym2151();
        }

        public void Init()
        {
            want.freq = SAMPLERATE;
            want.format = SDL2.SDL.AUDIO_S16SYS;
            want.channels = 2;
            want.samples = AUDIO_SAMPLES;
            want.callback = AudioCallback;
            want.userdata = IntPtr.Zero;

            if (audio_dev > 0)
            {
                SDL2.SDL.SDL_CloseAudioDevice(audio_dev);
            }
            audio_dev = SDL2.SDL.SDL_OpenAudioDevice(audio_dev_name, 0,ref want,out have, 9 /* freq | samples */);
            if (audio_dev <= 0)
            {
                Console.WriteLine("SDL_OpenAudioDevice failed: {0}", SDL2.SDL.SDL_GetError());
                if (!string.IsNullOrWhiteSpace(audio_dev_name)) UsageSound();
                return;
            }

            // init YM2151 emulation. 4 MHz clock
            ym2151.YM_Create(7159090); // 4000000 // 7159090
            ym2151.YM_init(have.freq, 60);

            // start playback
            SDL2.SDL.SDL_PauseAudioDevice(audio_dev, 0);
        }
        public void WriteAudio(int r, int v)
        {
            ym2151.YM_write_reg(r, v);
        }

        public void CloseAudio()
        {
            if (isStopped) return;
            SDL2.SDL.SDL_CloseAudioDevice(audio_dev);
            isStopped = true;
        }

        private void AudioCallback(IntPtr userdata, IntPtr stream, int len)
        {
            var source = new ushort[len];
            ym2151.YM_stream_update(source, len / 4);
            short[] target = new short[source.Length / 2];
            Buffer.BlockCopy(source, 0, target, 0, source.Length);
            Marshal.Copy(target, 0, stream, target.Length);
        }

        void UsageSound()
        {
            // SDL_GetAudioDeviceName doesn't work if audio isn't initialized.
            // Since argument parsing happens before initializing SDL, ensure the
            // audio subsystem is initialized before printing audio device names.
            SDL2.SDL.SDL_InitSubSystem(SDL2.SDL.SDL_INIT_AUDIO);

            // List all available sound devices
            Console.WriteLine("The following sound output devices are available:");
            var sounds = SDL2.SDL.SDL_GetNumAudioDevices(0);
            for (int i = 0; i < sounds; ++i)
                Console.WriteLine("\t{0}\n", SDL2.SDL.SDL_GetAudioDeviceName(i, 0));

            SDL2.SDL.SDL_Quit();
        }

        public void Dispose()
        {
            CloseAudio();
        }
    }
}
