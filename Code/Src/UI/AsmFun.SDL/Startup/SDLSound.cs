using AsmFun.CommanderX16.Audio;
using AsmFun.Computer.Common;
using AsmFun.Computer.Core.Sound.Yamaha2151;
using System;
using System.Runtime.InteropServices;

namespace AsmFun.Startup
{
    public class SDLSound : IDisposable, IAudioPlayer
    {
        private bool isStopped;
        string audio_dev_name ;
        /// <summary>
        /// refers to SDL_AudioDeviceID
        /// </summary>
        uint audio_dev = 0;
        private int vera_clks = 0;
        private int cpu_clks = 0;
        private short[][] buffers;
        private int rdidx = 0;
        private static int wridx = 0;
        private int buf_cnt = 0;
        private int num_bufs = 0;
        private SDL2.SDL.SDL_AudioSpec desired;
        private SDL2.SDL.SDL_AudioSpec obtained;


        private int expected = 2 * SAMPLES_PER_BUFFER * sizeof(short);

        public const int SAMPLES_PER_BUFFER = 256;
        private int SAMPLERATE = 25000000 / 512;

        private IVeraPsg veraPsg;
        private IVeraPCM veraPCM;
        private Ym2151 ym2151;
        // Is not a property and a single field for performance
        private bool isReadyAndEnabled;


        public bool IsEnabled { get; set; }

        public SDLSound()
        {
        }

        public void Init( int num_audio_buffers)
        {
           
            if (audio_dev > 0)
                SDL2.SDL.SDL_CloseAudioDevice(audio_dev);

            // Set number of buffers
            num_bufs = num_audio_buffers;
            if (num_bufs < 3)
                num_bufs = 3;

            if (num_bufs > 1024)
                num_bufs = 1024;


            // Allocate audio buffers
            buffers = new short[num_bufs][];
            for (int i = 0; i < num_bufs; i++)
                buffers[i] = new short[2 * SAMPLES_PER_BUFFER * 2];  // = 1024

            desired = new SDL2.SDL.SDL_AudioSpec();
            obtained = new SDL2.SDL.SDL_AudioSpec();
            desired.freq = SAMPLERATE;
            desired.format = SDL2.SDL.AUDIO_S16SYS;
            desired.channels = 2;
            desired.samples = SAMPLES_PER_BUFFER;
            desired.callback = AudioCallback;
            desired.userdata = IntPtr.Zero;

            
            
            audio_dev = SDL2.SDL.SDL_OpenAudioDevice(audio_dev_name, 0,ref desired,out obtained, 0);
            if (audio_dev <= 0)
            {
                Console.WriteLine("SDL_OpenAudioDevice failed: {0}", SDL2.SDL.SDL_GetError());
                if (!string.IsNullOrWhiteSpace(audio_dev_name)) UsageSound();
                return;
            }

           

            // start playback
            SDL2.SDL.SDL_PauseAudioDevice(audio_dev, 0);
            
        }

        public void InitDevices(IVeraPsg veraPsg, IVeraPCM veraPCM, Ym2151 ym2151)
        {
            this.veraPsg = veraPsg;
            this.veraPCM = veraPCM;
            this.ym2151 = ym2151;
            // init YM2151 emulation. 4 MHz clock
            ym2151.YM_Create(4000000); // 4000000 // 7159090
            ym2151.YM_init(obtained.freq, 60);
            isReadyAndEnabled = IsEnabled;
        }

        public void CloseAudio()
        {
            if (isStopped) return;
            SDL2.SDL.SDL_CloseAudioDevice(audio_dev);

            // Free audio buffers
            if (buffers != null)
                buffers = null;
            isStopped = true;
        }

        private void AudioCallback(IntPtr userdata, IntPtr stream, int len)
        {
            if (len != expected)
            {
                Console.Write("Audio buffer size mismatch! (expected: {0:D}, got: {1:D})\n", expected, len);
                return;
            }

            if (buf_cnt == 0)
            {
                //for (int i = 0; i < len / 8; i += 8)
                //	Marshal.WriteInt64(stream, i, 0x00);
                return;
            }
            Marshal.Copy(buffers[rdidx++], 0, stream, len);
            if (rdidx == num_bufs)
                rdidx = 0;

            buf_cnt--;
            //var source = new ushort[len];
            //ym2151.YM_stream_update(source, len / 4);
            //short[] target = new short[source.Length / 2];
            //Buffer.BlockCopy(source, 0, target, 0, source.Length);
            //Marshal.Copy(target, 0, stream, target.Length);
        }

        private const int clksCount = 512 * SAMPLES_PER_BUFFER;
        private const int SAMPLES_PER_BUFFER_2 = 2 * SAMPLES_PER_BUFFER;
        public void Render(int cpu_clocks)
        {
            if (!isReadyAndEnabled) return;
            cpu_clks += cpu_clocks;
            if (cpu_clks > 8)
            {
                int c = cpu_clks / 8;
                cpu_clks -= c * 8;
                vera_clks += c * 25;
            }
            while (vera_clks >= clksCount)
            {
                vera_clks -= clksCount;

                if (audio_dev != 0)
                {
                    short[] psg_buf = new short[SAMPLES_PER_BUFFER_2];
                    veraPsg.Render(psg_buf, SAMPLES_PER_BUFFER);

                    short[] pcm_buf = new short[SAMPLES_PER_BUFFER_2];
                    veraPCM.Render(pcm_buf, SAMPLES_PER_BUFFER);

                    ushort[] ym_buf = new ushort[SAMPLES_PER_BUFFER_2];
                    ym2151.YM_stream_update(ym_buf, SAMPLES_PER_BUFFER);

                    bool buf_available;
                    SDL2.SDL.SDL_LockAudioDevice(audio_dev);
                    buf_available = buf_cnt < num_bufs;
                    SDL2.SDL.SDL_UnlockAudioDevice(audio_dev);

                    if (buf_available)
                    {
                        // Mix PSG, PCM and YM output
                        short[] buf = buffers[wridx];
                        for (int i = 0; i < SAMPLES_PER_BUFFER_2; i++)
                            buf[i] = (short)((psg_buf[i] + pcm_buf[i] + ym_buf[i]) / 3);

                        SDL2.SDL.SDL_LockAudioDevice(audio_dev);
                        wridx++;
                        if (wridx == num_bufs)
                            wridx = 0;

                        buf_cnt++;
                        SDL2.SDL.SDL_UnlockAudioDevice(audio_dev);
                    }
                }
            }
        }

        public void UsageSound()
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
