using System.Collections.Generic;

namespace AsmFun.CommanderX16.IO
{
	public class X16PS2AccessR34 : IX16PS2Access
	{
		private readonly Queue<byte> pressedKeys = new Queue<byte>();

		public readonly int PS2_DATA_MASK = 1;
		public readonly int PS2_CLK_MASK = 2;
		private readonly int PS2_BUFFER_SIZE = 32;
		private byte buttons;
		private short mouse_diff_x = 0;
		private short mouse_diff_y = 0;
		public PS2State[] state;
		public PS2Port[] ps2_port;
		private byte HOLD = 25 * 8; /* 25 x ~3 cycles at 8 MHz = 75µs */

		public class PS2Buffer
		{
			public byte[] data;
			public byte read;
			public byte write;
			public PS2Buffer(int bufferSize)
			{
				data = new byte[bufferSize];
			}
		}
		public class PS2Port
		{
			public int clk_out;
			public int data_out;
			public int clk_in;
			public int data_in;
		}
		public class PS2State
		{
			public bool sending;
			public bool has_byte;
			public byte current_byte;
			public int bit_index;
			public int data_bits;
			public int send_state;
			public PS2Buffer buffer;
			public PS2State(int bufferSize)
			{
				buffer = new PS2Buffer(bufferSize);
			}
		}

		public X16PS2AccessR34()
		{
			state = new PS2State[2];
			for (int i = 0; i < 2; i++)
				state[i] = new PS2State(PS2_BUFFER_SIZE);
			ps2_port = new PS2Port[2];
			for (int i = 0; i < 2; i++)
				ps2_port[i] = new PS2Port();
		}

		public bool ps2_buffer_can_fit(int i, int n)
		{
			// Math is hard. There's certainly a way to do this without a loop.
			for (int n2 = 1; n2 < n; n2++)
			{
				if ((state[i].buffer.write + n2) % PS2_BUFFER_SIZE == state[i].buffer.read)
				{
					return false;
				}
			}
			return true;
		}

		public void ps2_buffer_add(int i, byte byte1)
		{
			if (!ps2_buffer_can_fit(i, 1))
			{
				return;
			}

			state[i].buffer.data[state[i].buffer.write] = byte1;
			state[i].buffer.write = (byte)((state[i].buffer.write + 1) % PS2_BUFFER_SIZE);
		}

		public int ps2_buffer_remove(int i)
		{
			if (state[i].buffer.read == state[i].buffer.write)
			{
				return -1; // empty
			}
			else
			{
				byte byte1 = state[i].buffer.data[state[i].buffer.read];
				state[i].buffer.read = (byte)((state[i].buffer.read + 1) % PS2_BUFFER_SIZE);
				return byte1;
			}
		}
		

		
		private void ps2_step(int i)
		{
			if (ps2_port[i].clk_in ==0 && ps2_port[i].data_in > 0)
			{ // communication inhibited
				ps2_port[i].clk_out = 0;
				ps2_port[i].data_out = 0;
				state[i].sending = false;
				//		printf("PS2[%d]: STATE: communication inhibited.\n", i);
				return;
			}
			else if (ps2_port[i].clk_in > 0 && ps2_port[i].data_in > 0)
			{ // idle state
			  //		printf("PS2[%d]: STATE: idle\n", i);
				if (!state[i].sending)
				{
					// get next byte
					if (!state[i].has_byte)
					{
						int current_byte = ps2_buffer_remove(i);
						if (current_byte < 0)
						{
							// we have nothing to send
							ps2_port[i].clk_out = 1;
							ps2_port[i].data_out = 0;
							//					printf("PS2[%d]: nothing to send.\n", i);
							return;
						}
						state[i].current_byte = (byte)current_byte;
						//				printf("PS2[%d]: current_byte: %x\n", i, state[i].current_byte);
						state[i].has_byte = true;
					}

					state[i].data_bits = state[i].current_byte << 1 | (1 - __builtin_parity(state[i].current_byte)) << 9 | (1 << 10);
					//			printf("PS2[%d]: data_bits: %x\n", i, state[i].data_bits);
					state[i].bit_index = 0;
					state[i].send_state = 0;
					state[i].sending = true;
				}

				if (state[i].send_state <= HOLD)
				{
					ps2_port[i].clk_out = 0; // data ready
					ps2_port[i].data_out = state[i].data_bits & 1;
					//			printf("PS2[%d]: [%d]sending #%d: %x\n", i, state[i].send_state, state[i].bit_index, state[i].data_bits & 1);
					if (state[i].send_state == 0 && state[i].bit_index == 10)
					{
						// we have sent the last bit, if the host
						// inhibits now, we'll send the next byte
						state[i].has_byte = false;
					}
					if (state[i].send_state == HOLD)
					{
						state[i].data_bits >>= 1;
						state[i].bit_index++;
					}
					state[i].send_state++;
				}
				else if (state[i].send_state <= 2 * HOLD)
				{
					//			printf("PS2[%d]: [%d]not ready\n", i, state[i].send_state);
					ps2_port[i].clk_out = 1; // not ready
					ps2_port[i].data_out = 0;
					if (state[i].send_state == 2 * HOLD)
					{
						//				printf("XXX bit_index: %d\n", state[i].bit_index);
						if (state[i].bit_index < 11)
						{
							state[i].send_state = 0;
						}
						else
						{
							state[i].sending = false;
						}
					}
					if (state[i].send_state > 0)
					{
						state[i].send_state++;
					}
				}
			}
			else
			{
				//		printf("PS2[%d]: Warning: unknown PS/2 bus state: CLK_IN=%d, DATA_IN=%d\n", i, ps2_port[i].clk_in, ps2_port[i].data_in);
				ps2_port[i].clk_out = 0;
				ps2_port[i].data_out = 0;
			}
		}


	

		// byte 0, bit 7: Y overflow
		// byte 0, bit 6: X overflow
		// byte 0, bit 5: Y sign bit
		// byte 0, bit 4: X sign bit
		// byte 0, bit 3: Always 1
		// byte 0, bit 2: Middle Btn
		// byte 0, bit 1: Right Btn
		// byte 0, bit 0: Left Btn
		// byte 2:        X Movement
		// byte 3:        Y Movement


		private bool mouse_send(int x, int y, int b)
		{
			if (ps2_buffer_can_fit(1, 3))
			{
				byte byte0 = (byte)(((y >> 9) & 1) << 5 | ((x >> 9) & 1) << 4 | 1 << 3 | b);
				byte byte1 = (byte)x;
				byte byte2 = (byte)y;
				//		printf("%02X %02X %02X\n", byte0, byte1, byte2);

				ps2_buffer_add(1, byte0);
				ps2_buffer_add(1, byte1);
				ps2_buffer_add(1, byte2);

				return true;
			}
			else
			{
				//		printf("buffer full, skipping...\n");
				return false;
			}
		}

		private void mouse_send_state()
		{
			if (mouse_diff_x > 255)
			{
				mouse_send(255, 0, buttons);
				mouse_diff_x -= 255;
			}
			if (mouse_diff_x < -256)
			{
				mouse_send(-256, 0, buttons);
				mouse_diff_x -= -256;
			}
			if (mouse_diff_y > 255)
			{
				mouse_send(0, 255, buttons);
				mouse_diff_y -= 255;
			}
			if (mouse_diff_y < -256)
			{
				mouse_send(0, -256, buttons);
				mouse_diff_y -= -256;
			}
			if (mouse_send(mouse_diff_x, mouse_diff_y, buttons))
			{
				mouse_diff_x = 0;
				mouse_diff_y = 0;
			}
		}


		private void mouse_button_down(int num)
		{
			buttons = (byte)(buttons | 1 << num);
			mouse_send_state();
		}

		private void mouse_button_up(int num)
		{
			buttons = (byte)(buttons & (1 << num) ^ 0xff);
			mouse_send_state();
		}

		private void mouse_move(int x, int y)
		{
			mouse_diff_x = (short)(mouse_diff_x + x);
			mouse_diff_y = (short)(mouse_diff_y + y);
			mouse_send_state();
		}

		private byte mouse_read(byte reg)
		{
			return 0xff;
		}


		private int __builtin_parity(int n)
		{
			int p = 0;
			while (n > 0)
			{
				p += n & 1;
				n >>= 1;
			}
			return p & 1;
		}





		private int waiter = 0;
		public void Step()
		{
			if (!state[0].has_byte && !state[0].sending && pressedKeys.Count > 0)
			{ 
				waiter++;
				if (waiter > 30000)
				{
					byte b;
					lock (pressedKeys) b = pressedKeys.Dequeue();
					ps2_buffer_add(0, b);
					waiter = 0;
				}
				
			}
			ps2_step(0);
			ps2_step(1);
		}
		public void KeyPressed(byte keyCode)
		{
			lock (pressedKeys)
				pressedKeys.Enqueue(keyCode);
		}

		
		public byte GetValueForViaPB(byte via2reg2)
		{
			byte value = (byte)(
				   ((via2reg2 & PS2_CLK_MASK) > 0 ? 0 : ps2_port[1].clk_out << 1) |
				   ((via2reg2 & PS2_DATA_MASK) > 0 ? 0 : ps2_port[1].data_out));
			return value;
		}
		public byte GetValueForViaPA(byte via2reg3)
		{
			var isClock = (via2reg3 & PS2_CLK_MASK) != 0;
			var isData = (via2reg3 & PS2_DATA_MASK) != 0;
			var isNotClockValue = isClock ? 0 : ps2_port[0].clk_out << 1;
			var isNotDataValue = isData ? 0 : ps2_port[0].data_out;
			var value = (byte)(isNotClockValue | isNotDataValue);
			return value;
		}
		public void SetDataFromViaPB(byte via2reg0, byte via2reg2)
		{
			ps2_port[1].clk_in = (via2reg2 & PS2_CLK_MASK) > 0 ? via2reg0 & PS2_CLK_MASK : 1;
			ps2_port[1].data_in = (via2reg2 & PS2_DATA_MASK) > 0 ? via2reg0 & PS2_DATA_MASK : 1;
		}
		public void SetDataFromViaPA(byte via2reg1, byte via2reg3)
		{
			ps2_port[0].clk_in = (via2reg3 & PS2_CLK_MASK) != 0 ? via2reg1 & PS2_CLK_MASK : 1;
			ps2_port[0].data_in = (via2reg3 & PS2_DATA_MASK) != 0 ? via2reg1 & PS2_DATA_MASK : 1;
		}

		
	}
}
