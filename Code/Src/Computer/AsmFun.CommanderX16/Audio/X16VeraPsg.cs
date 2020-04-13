using AsmFun.Computer.Common.Video;
using System;

namespace AsmFun.CommanderX16.Audio
{
	public interface IVeraPsg : IMemoryAccessable
	{
		void Render(short[] buf, uint num_samples);
	}
	// https://github.com/rzo42/cx16programs/blob/master/X16%20PSG%20Note%20Table.pdf?fbclid=IwAR049vjM29F8i8SNsQsGRczMyrPwgEs03LDawYPH-eazCGtHeTp6j_YSPvg
	public class X16VeraPsg : IVeraPsg
	{
		private Random random = new Random();
		private enum WaveForm
		{
			WF_PULSE = 0,
			WF_SAWTOOTH = 1,
			WF_TRIANGLE = 2,
			WF_NOISE = 3
		}

		private class Channel
		{
			public ushort freq;
			public byte volume;
			public bool left;
			public bool right;
			public byte pw;
			public WaveForm waveform;

			public uint phase;
			public byte noiseval;
		}


		private Channel[] channels;

		private byte[] volume_lut = {
				0, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3,
				4, 4, 4, 4, 5, 5, 5, 6, 6, 7, 7, 7, 8, 8, 9, 9,
				10, 11, 11, 12, 13, 14, 14, 15, 16, 17, 18, 19, 21, 22, 23, 25,
				26, 28, 29, 31, 33, 35, 37, 39, 42, 44, 47, 50, 52, 56, 59, 63 };

		public string Name => "VeraPSG";

		public void Init()
		{
		}

		public void Reset()
		{
			channels = new Channel[16];
			for (int i = 0; i < 16; i++)
				channels[i] = new Channel();
		}

		public void Render(short[] buf, uint num_samples)
		{
			var index = 0;
			while (num_samples-- != 0)
			{
				Render(buf, index);
				index += 2;
			}
		}

		private void Render(short[] buffer, int indexToWrite)
		{
			int l = 0;
			int r = 0;

			for (int i = 0; i < 16; i++)
			{
				Channel ch = channels[i];

				uint new_phase = (ch.phase + ch.freq) & 0x1FFFF;
				ch.phase = new_phase;

				byte v = 0;
				switch (ch.waveform)
				{
					case WaveForm.WF_PULSE:
						v = (byte)((ch.phase >> 10) > ch.pw ? 0 : 63);
						break;
					case WaveForm.WF_SAWTOOTH:
						v = (byte)(ch.phase >> 11);
						break;
					case WaveForm.WF_TRIANGLE:
						v = (ch.phase & 0x10000) != 0 ? (byte)(~(ch.phase >> 10) & 0x3F) : (byte)((ch.phase >> 10) & 0x3F);
						break;
					case WaveForm.WF_NOISE:
						if ((ch.phase & 0x10000) != (new_phase & 0x10000))
							ch.noiseval = (byte)(random.Next() & 63);
						v = ch.noiseval;
						break;
				}
				byte sv = (byte)(v ^ 0x20);
				if ((sv & 0x20) != 0)
					sv |= 0xC0;

				int val = sv * ch.volume;

				if (ch.left)
					l += val;
				if (ch.right)
					r += val;
			}
			// left
			buffer[indexToWrite] = (short)l;
			// Right
			buffer[indexToWrite +1] = (short)r;
		}


		public byte Read(uint address)
		{
			return 0;
		}

		public byte[] ReadBlock(uint address, int length)
		{
			//var buf = new byte[length];
			//Array.Copy(reg_sprites, address & 0xf, buf, 0, length);
			return new byte[] { };
		}

		public void Write(uint address, byte val)
		{
			//reg = 0x3f;
			var reg = (byte)address;
			int ch = reg / 4;
			int idx = reg & 3;

			switch (idx)
			{
				case 0:
					channels[ch].freq = (ushort)((channels[ch].freq & 0xFF00) | val);
					break;
				case 1:
					channels[ch].freq = (ushort)((channels[ch].freq & 0x00FF) | (val << 8));
					break;
				case 2:
					{
						channels[ch].right = (val & 0x80) != 0;
						channels[ch].left = (val & 0x40) != 0;
						channels[ch].volume = volume_lut[val & 0x3F];
						break;
					}
				case 3:
					{
						channels[ch].pw = (byte)(val & 0x3F);
						channels[ch].waveform = (WaveForm)(val >> 6);
						break;
					}
			}
		}

		public void WriteBlock(byte[] bytes, int sourceIndex, int targetIndex, int length)
		{
			//Array.Copy(bytes, sourceIndex, reg_sprites, targetIndex, length);
		}
		public void MemoryDump(byte[] data, int startInsertAddress)
		{
			//Array.Copy(reg_sprites, 0, data, startInsertAddress, reg_sprites.Length);
		}

		public byte[] MemoryDump(int startAddress)
		{
			return new byte[] { };// reg_sprites.ToArray();
		}

	
	}

}
