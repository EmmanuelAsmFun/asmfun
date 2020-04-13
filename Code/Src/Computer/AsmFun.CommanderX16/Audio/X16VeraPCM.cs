using System;

namespace AsmFun.CommanderX16.Audio
{
	public interface IVeraPCM
	{
		void Reset();
		void WriteCtrl(byte val);
		void WriteFifo(byte val);
		byte ReadCtrl();
		byte ReadRate();
		bool IsFifoAlmostEmpty();
		void WriteRate(byte value);
		void Render(short[] buf, uint num_samples);

	}
	public class X16VeraPCM : IVeraPCM
	{

		private byte[] fifo = new byte[4096 - 1]; // Actual hardware FIFO is 4kB, but you can only use 4095 bytes.
		private uint fifo_wridx;
		private uint fifo_rdidx;
		private uint fifo_cnt;

		private byte ctrl;
		private byte rate;

		private byte[] volume_lut = { 0, 1, 2, 3, 4, 5, 6, 8, 11, 14, 18, 23, 30, 38, 49, 64 };

		private short cur_l;
		private short cur_r;
		private byte phase;

		public X16VeraPCM()
		{
			UpdateWriteMethod();
		}
		private void FifoReset()
		{
			fifo_wridx = 0;
			fifo_rdidx = 0;
			fifo_cnt = 0;
		}

		public void Reset()
		{
			FifoReset();
			ctrl = 0;
			rate = 0;
			cur_l = 0;
			cur_r = 0;
			phase = 0;
			UpdateWriteMethod();
		}

		public void WriteCtrl(byte val)
		{
			if ((val & 0x80) != 0)
				FifoReset();

			ctrl = (byte)(val & 0x3F);
		}

		public byte ReadCtrl()
		{
			byte result = ctrl;
			if (fifo_cnt == sizeof(byte))
			{
				result |= 0x80;
			}
			return result;
		}

		public void WriteRate(byte val)
		{
			rate = val;
		}

		public byte ReadRate()
		{
			return rate;
		}

		public void WriteFifo(byte val)
		{
			if (fifo_cnt < sizeof(byte))
			{
				fifo[fifo_wridx++] = val;
				if (fifo_wridx == sizeof(byte))
					fifo_wridx = 0;
				
				fifo_cnt++;
			}
		}

		private byte ReadFifo()
		{
			if (fifo_cnt == 0)
				return 0;
			
			byte result = fifo[fifo_rdidx++];
			if (fifo_rdidx == sizeof(byte))
				fifo_rdidx = 0;
			
			fifo_cnt--;
			return result;
		}

		public bool IsFifoAlmostEmpty()
		{
			return fifo_cnt < 1024;
		}

		public void Render(short[] buf, uint num_samples)
		{
			var index = 0;
			while (num_samples-- != 0)
			{
				byte old_phase = phase;
				phase += rate;
				if ((old_phase & 0x80) != (phase & 0x80))
					WriteMethod();

				buf[index] = (short)((cur_l * volume_lut[ctrl & 0xF]) >> 6);
				index++;
				buf[index] = (short)((cur_r * volume_lut[ctrl & 0xF]) >> 6);
				index++;
			}
		}

		private Action WriteMethod;
		private void UpdateWriteMethod()
		{
			switch ((ctrl >> 4) & 3)
			{
				case 0:
					WriteMethod = () =>
					{ // mono 8-bit
						cur_l = (short)(ReadFifo() << 8);
						cur_r = cur_l;
					};
					break;
				case 1:
					WriteMethod = () =>
					{ // stereo 8-bit
						cur_l = (short)(ReadFifo() << 8);
						cur_r = (short)(ReadFifo() << 8);
					};
					break;
				case 2:
					WriteMethod = () =>
					{ // mono 16-bit
						cur_l = ReadFifo();
						cur_l |= (short)(ReadFifo() << 8);
						cur_r = cur_l;
					};
					break;
				case 3:
					WriteMethod = () =>
					{ // stereo 16-bit
						cur_l = ReadFifo();
						cur_l |= (short)(ReadFifo() << 8);
						cur_r = ReadFifo();
						cur_r |= (short)(ReadFifo() << 8);
					};
					break;
			}
		}

	}
}
