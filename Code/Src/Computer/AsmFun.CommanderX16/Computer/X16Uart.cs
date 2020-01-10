using AsmFun.Computer.Common.Video;
using System;

namespace AsmFun.CommanderX16.Computer
{
	public interface IUart : IMemoryAccessable
	{
		void Step();
	}
	public class X16Uart : IUart, IDisposable
	{
		private ushort bauddiv;
		private byte byte_in;
		private float countdown_in;
		private float countdown_out;
		public const int BITS_PER_BYTE = 9; // 8N1 is 9 bits
		public int SPEED_RATIO = Convert.ToInt32(25.0 / 8);

		public string Name => "Uart";

		public void Init()
		{
			// baud = 25000000 / (bauddiv+1)
			bauddiv = 24; // 1 MHz
			countdown_out = 0F;
			countdown_in = 0F;

			CacheNextChar();
		}
		public void Reset()
		{

		}

		public void Step()
		{
			// Todo: Serial port
			//if (countdown_out > 0)
			//	countdown_out -= SPEED_RATIO;
			//if (countdown_in > 0)
			//{
			//	countdown_in -= SPEED_RATIO;
			//	if (countdown_in <= 0)
			//		CacheNextChar();
			//}
		}

		private bool TxBusy()
		{
			return countdown_out > 0F;
		}

		private bool DataAvailable()
		{
			//if (countdown_in > 0F) return false;
			//if (uart_in_file == null) return false;
			//if (feof(uart_in_file)) return false;
			return true;
		}

		private void CacheNextChar()
		{
			//if (uart_in_file != null)
			//{
			//	byte_in = fgetc(uart_in_file);
			//}
		}

		private byte Read(byte reg)
		{
			switch (reg)
			{
				case 0:
					{
						countdown_in = bauddiv * BITS_PER_BYTE;
						return byte_in;
					}
				case 1:
						return (byte)(((TxBusy()?1:0) << 1) | (DataAvailable()?1:0));
				case 2:
					return (byte)(bauddiv & 0xff);
				case 3:
					return (byte)(bauddiv >> 8);
			}
			return 0;
		}

		private void Write(byte reg, byte value)
		{
			switch (reg)
			{
				case 0:
					if (TxBusy())
					{
						Console.Write("UART WRITTEN WHILE BUSY!! ${0:x2}\n", value);
					}
					else
					{
						//if (uart_out_file)
						//	fputc(value, uart_out_file);
						countdown_out = bauddiv * BITS_PER_BYTE;
					}
					break;
				case 1:
					break;
				case 2:
					bauddiv = (ushort)((bauddiv & 0xff00) | value);
					break;
				case 3:
					bauddiv = (ushort)((bauddiv & 0xff) | (value << 8));
					break;
			}
		}

		

		public void Write(uint address, byte value)
		{
			var add = address & 1;
			Write((byte)add, value);
		}

		public byte Read(uint address)
		{
			var add = address & 3;
			return Read((byte)add);
		}

		public byte[] ReadBlock(uint address, int length)
		{
			return new byte[] { };
		}

		public void WriteBlock(byte[] bytes, int sourceIndex, int targetIndex, int length)
		{
			
		}

		public void MemoryDump(byte[] data, int startInsertAddress)
		{
			
		}

		public byte[] MemoryDump(int startAddress)
		{
			return new byte[] { };
		}
		public void Dispose()
		{

		}

	
	}
}
