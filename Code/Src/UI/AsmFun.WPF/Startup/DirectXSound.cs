using AsmFun.Computer.Core.Sound.Yamaha2151;
using SharpDX;
using SharpDX.DirectSound;
using SharpDX.Multimedia;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace AsmFun.Startup
{
    public class DirectXSound : IDisposable
    {
        private bool isStopped;
        string audio_dev_name;
        /// <summary>
        /// refers to SDL_AudioDeviceID
        /// </summary>
        uint audio_dev = 0;
        private ushort AUDIO_SAMPLES = 1024; // 1024;// 4096 // 256
        private int SAMPLERATE = 22050;

        private Ym2151 ym2151;
        DirectSound m_DirectSound;
        PrimarySoundBuffer primarySoundBuffer;
        SecondarySoundBuffer secondarySoundBuffer;
        WaveFormat waveFormat;

        public DirectXSound()
        {
            ym2151 = new Ym2151();
        }

        public void Init()
        {
            Task.Run(() =>
            {
                Task.Delay(1000).Wait();
                InitInternal();
            });
        }
        private void InitInternal()
        {


            var handle = Process.GetCurrentProcess().MainWindowHandle;
            m_DirectSound = new DirectSound();
            m_DirectSound.SetCooperativeLevel(handle, CooperativeLevel.Priority);
            //m_DirectSound.IsDefaultPool = false;
            waveFormat = new WaveFormat(SAMPLERATE, 2);

            // Primary
            var primaryBufferDesc = new SoundBufferDescription();
            primaryBufferDesc.Flags = BufferFlags.PrimaryBuffer;
            primaryBufferDesc.AlgorithmFor3D = Guid.Empty;
            primarySoundBuffer = new PrimarySoundBuffer(m_DirectSound, primaryBufferDesc);

            // Secondary
            var secondaryBufferDesc = new SoundBufferDescription();
            secondaryBufferDesc.BufferBytes = AUDIO_SAMPLES;
            secondaryBufferDesc.Format = waveFormat;
            secondaryBufferDesc.Flags = BufferFlags.GetCurrentPosition2 | BufferFlags.ControlPositionNotify | BufferFlags.GlobalFocus |
                                        BufferFlags.ControlVolume | BufferFlags.StickyFocus;
            secondaryBufferDesc.AlgorithmFor3D = Guid.Empty;
            secondarySoundBuffer = new SecondarySoundBuffer(m_DirectSound, secondaryBufferDesc);

            var caps = secondarySoundBuffer.Capabilities;

            // init YM2151 emulation. 4 MHz clock
            ym2151.YM_Create(7159090); // 4000000 // 7159090
            ym2151.YM_init(SAMPLERATE, 60);

            // start playback
            primarySoundBuffer.Play(0, PlayFlags.Looping);
            secondarySoundBuffer.Play(0, PlayFlags.Looping);
            //var soundstream = new SoundStream(nativefilestream);
            Task.Run(() =>
            {
                while (!isStopped)
                {
                    AudioCallback(128);
                    Task.Delay(5);
                }
            });
        }
        public void WriteAudio(int r, int v)
        {
            ym2151.YM_write_reg(r, v);
        }

        public void CloseAudio()
        {
            if (isStopped) return;
            if (primarySoundBuffer != null) primarySoundBuffer.Dispose();
            if (secondarySoundBuffer != null) secondarySoundBuffer.Dispose();
            if (m_DirectSound != null) m_DirectSound.Dispose();
            isStopped = true;
        }

        private void AudioCallback(int len)
        {
            var source = new ushort[len];
            ym2151.YM_stream_update(source, len / 4);
            //short[] target = new short[source.Length / 2];
            byte[] target2 = new byte[len];
            //Buffer.BlockCopy(source, 0, target, 0, source.Length);
            Buffer.BlockCopy(source, 0, target2, 0, len);
            //Marshal.Copy(target, 0, stream, target.Length);
            // Lock the buffer
            DataStream dataPart2;
            var capabilities = secondarySoundBuffer.Capabilities;
            var dataPart1 = secondarySoundBuffer.Lock(0, capabilities.BufferBytes, LockFlags.EntireBuffer, out dataPart2);
            dataPart1.Write(target2, 0, len);

            // Unlock the buffer
            secondarySoundBuffer.Unlock(dataPart1, dataPart2);

        }



        public void Dispose()
        {
            CloseAudio();
        }
    }
}
