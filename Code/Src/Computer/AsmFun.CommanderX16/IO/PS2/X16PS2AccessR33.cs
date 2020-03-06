// Heavely inspired from https://github.com/commanderx16/x16-emulator

using System;
using System.Collections.Generic;
using System.Threading;

namespace AsmFun.CommanderX16.IO
{
    public class X16PS2AccessR33 : IX16PS2Access
    {
        private readonly Queue<byte> pressedKeys = new Queue<byte>();
        private const int PS2_DATA_MASK = 1;
        private const int PS2_CLK_MASK = 2;
        private const int KBD_BUFFER_SIZE = 32;
        private const int HOLD = 25 * 8; // 25 x ~3 cycles at 8 MHz = 75µs
        private List<bool> ToSend = new List<bool>();

        private byte[] kbd_buffer = new byte[KBD_BUFFER_SIZE];
        private byte kbd_buffer_read = 0;
        private byte kbd_buffer_write = 0;

        private bool sending = false;
        private bool has_byte = false;
        private byte current_byte;
        private int bit_index = 0;
        private int data_bits;
        private int send_state = 0;


        private int ps2_clk_out;
        private int ps2_data_out;
        private int ps2_clk_in;
        private int ps2_data_in;


        private byte buttons;
        private ushort mouse_x = 0;
        private ushort mouse_y = 0;

        public X16PS2AccessR33()
        {
            InitThread();
        }


        public void KeyPressed(byte keyCode)
        {
            lock(pressedKeys)
                pressedKeys.Enqueue(keyCode);
        }

        

        #region Thread

        Thread thread;


        private bool isRunning;
        private void InitThread()
        {
            thread = new Thread(Run);
            thread.IsBackground = false;
        }
        int interlock = 1;
        private void Run()
        {

            while (isRunning)
            {
                Step2();
                //while(Interlocked.CompareExchange(ref interlock, 0, 1) != 1)
                while (interlock != 1)
                { }
                interlock = 2;
            }
        }
        public void Step2()
        {
            if (!isRunning)
            {
                isRunning = true;
                thread.Start();
            }
            //            are.Set();
            interlock = 1;
        }

        #endregion

        public void Step3() { }
        public void Step()
        {
            if (!has_byte && !sending && pressedKeys.Count >0 && !IsBufferFull())
            {
                byte b;
                lock (pressedKeys) b = pressedKeys.Dequeue();
                kbd_buffer_add(b);
            }
            if (ps2_clk_in == 0 && ps2_data_in == 1)
            { // communication inhibited
                ps2_clk_out = 0;
                ps2_data_out = 0;
                sending = false;
                //		printf("PS2: STATE: communication inhibited.\n");
                return;
            }
            else if (ps2_clk_in == 1 && ps2_data_in == 1)
            { // idle state
              //		printf("PS2: STATE: idle\n");
                if (!sending)
                {
                    // get next byte
                    if (!has_byte)
                    {
                        current_byte = kbd_buffer_remove();
                        if (current_byte == 0)
                        {
                            // we have nothing to send
                            ps2_clk_out = 1;
                            ps2_data_out = 0;
                            //					printf("PS2: nothing to send.\n");
                            return;
                        }
                        //				printf("PS2: current_byte: %x\n", current_byte);
                        has_byte = true;
                    }
                    data_bits = current_byte << 1 | (1 - parity(current_byte)) << 9 | (1 << 10);
                    //Console.WriteLine($"PS2: data_bits: {data_bits}");
                    bit_index = 0;
                    send_state = 0;
                    sending = true;
                }

                if (send_state <= HOLD)
                {
                    ps2_clk_out = 0; // data ready
                    ps2_data_out = data_bits & 1;
                    
                    //if (send_state == 0)
                        //Console.WriteLine($"PS2: {send_state}sending {bit_index}: {(ps2_data_out)}");
                    if (send_state == 0 && bit_index == 10)
                    {
                        // we have sent the last bit, if the host
                        // inhibits now, we'll send the next byte
                        has_byte = false;
                    }
                    if (send_state == HOLD)
                    {
                        //Console.Write(ps2_data_out + " ");
                        data_bits >>= 1;
                        //Console.WriteLine($"XXX Abit_index: {bit_index}");
                        bit_index++;
                    }
                    send_state++;
                }
                else if (send_state <= 2 * HOLD)
                {
                    //Console.WriteLine($"PS2: {send_state}not ready");
                    ps2_clk_out = 1; // not ready
                    ps2_data_out = 0;
                    if (send_state == 2 * HOLD)
                    {

                        //Console.WriteLine($"XXX Bbit_index: {bit_index}");
                        if (bit_index < 11)
                            send_state = 0;
                        else
                        {
                            sending = false;
                            //Console.WriteLine();
                        }
                        }
                    if (send_state > 0)
                        send_state++;
                }
            }
            else
            {
                //		printf("PS2: Warning: unknown PS/2 bus state: CLK_IN=%d, DATA_IN=%d\n", ps2_clk_in, ps2_data_in);
                ps2_clk_out = 0;
                ps2_data_out = 0;
            }
        }





        // run = 0x2D, 0xF0, 0x2D, 0x3C, 0x31, 0xF0, 0x3C, 0xF0, 0x31,
        // r = 0x2D, 0xF0, 0x2D
        // [ =      0x14, 0xE0, 0x11,  0x54, 0xF0, 0x54,                                            ~0xF0, 0x14, 0xE0,~0xF0, 0x11,
        // AltGr =  0x14, 0xE0, 0x11,                                                               ~0xF0, 0x14, 0xE0,~0xF0, 0x11,
        //          0x14, 0xE0, 0x11,  0x14, 0xE0, 0x11,  0x14, 0xE0, 0x11,     0x54, 0xF0, 0x54,   ~0xF0, 0x14, 0xE0,~0xF0, 0x11,
        // @ =      0xE0, 0x11, 0x1E, ~0xF0, 0x1E, 0xE0,~0xF0, 0x11,
        // # =      0x14, 0xE0, 0x11, 0x26, 0xF0, 0x26,                                             ~0xF0, 0x14, 0xE0,~0xF0, 0x11,
        private bool kbd_buffer_add(byte code)
        {
            //Console.Write($"0x{(code.ToString("X2"))}({kbd_buffer_write}),");
            //Console.Write($"0x{(code.ToString("X2"))},");
            if ((kbd_buffer_write + 1) % KBD_BUFFER_SIZE == kbd_buffer_read)
                return true; // buffer full

            kbd_buffer[kbd_buffer_write] = code;
            //Console.Write("Bits ");
            // Convert to bits
            ////var bits = code << 1 | (1 - parity(code)) << 9 | (1 << 10);
            ////var temp = new bool[11];
            ////for (int i = 0; i < 11; i++)
            ////{
            ////    var vall = bits & 1;
            ////    temp[i] = vall > 0;

            ////    bits >>= 1;
            ////    Console.Write((temp[i]?1:0 )+ " ");
            ////}
            ////Console.WriteLine();
            ////lock(ToSend)
            ////    ToSend.AddRange(temp);
            ////isSendingData = true;
            kbd_buffer_write = (byte)((kbd_buffer_write + 1) % KBD_BUFFER_SIZE);
            return false;
        }

        private byte kbd_buffer_remove()
        {
            if (kbd_buffer_read == kbd_buffer_write)
                return 0; // empty
            else
            {
                byte code = kbd_buffer[kbd_buffer_read];
                kbd_buffer_read = (byte)((kbd_buffer_read + 1) % KBD_BUFFER_SIZE);
                return code;
            }

        }

        public bool IsBufferFull()
        {
            return ((kbd_buffer_write + 1) % KBD_BUFFER_SIZE == kbd_buffer_read);
        }

        int waiter = 0;
        int prev = 0;
        int bitIndex = 0;
        public void SetDataFromViaPA(byte via2reg1, byte via2reg3)
        {
            ps2_clk_in = (via2reg3 & PS2_CLK_MASK) != 0 ? via2reg1 & PS2_CLK_MASK : 1;
            ps2_data_in = (via2reg3 & PS2_DATA_MASK) != 0 ? via2reg1 & PS2_DATA_MASK : 1;
        }

        private bool isSendingData = false;
        private bool bitToSend = false;
        public byte GetValueForViaPA(byte via2reg3)
        {
           
            //    //Console.WriteLine(ps2_clk_in + " : " + ps2_data_in);
            //    //if (ps2_clk_in == 0 && ps2_data_in == 1)
            //    if (ToSend.Count > 0)
            //{
            //    if (waiter == 0)
            //    {
            //         ps2_clk_out = 0; // data ready
            //        Console.WriteLine($"V2 XXX bit_index: {bitIndex}");
            //        waiter = 1;
            //        lock (ToSend)
            //        {
            //            bitToSend = ToSend[0];
            //            ToSend.RemoveAt(0);
            //        }
            //    }
            //}
            
            //if (isSendingData)
            //{
            //    if (waiter == 28)
            //    {
            //        Console.WriteLine($"V2 Half {bitIndex}");
            //        bitIndex++;
            //        bitIndex = ((bitIndex + 1) % 12) == 0 ? 0 : bitIndex;
            //        bitToSend = false;
            //        ps2_clk_out = 1; // not ready
            //    }

            //    //Console.WriteLine($"PS2: {waiter} NVIA {bitIndex}({bit_index}): {(bitToSend ? 1 : 0)}({ps2_data_out})");
            //    waiter++;
            //    if (waiter >= 57)
            //    {
            //        ps2_clk_out = 1; // not ready
            //        //ps2_data_out = 0;
            //        waiter = 0;
            //        if (ToSend.Count == 0)
            //        {
            //            isSendingData = false;
            //            bitIndex = 0;
            //            bitToSend = false;
            //            Console.WriteLine($"V2 Done");
            //        }
            //    }
                
            //}
            //Console.WriteLine(ps2_clk_in + " : " + ps2_data_in);

            //var bitToSend = 
            var isClock = (via2reg3 & PS2_CLK_MASK) != 0;
            var isData =( via2reg3 & PS2_DATA_MASK) != 0;
            var isNotDataValue = isData ? 0 : ps2_data_out; 
            //var isNotDataValue = isData ? 0 : (bitToSend?1:0);
            var isNotClockValue = isClock ? 0 : ps2_clk_out << 1;
            var value = (byte)(isNotClockValue | isNotDataValue);
            if (bitToSend != ps2_data_out > 0)
            {


            }
            //byte value = (byte)(((via2reg3 & PS2_CLK_MASK) != 0
            //    ? 0 : ps2_clk_out << 1) | ((via2reg3 & PS2_DATA_MASK) != 0
            //    ? 0 : ps2_data_out));
            //Console.WriteLine($"PS2: {send_state} VIA Read:{(bitToSend?1:0)}({ps2_data_out})");

            return value;
        }

        #region Mouse

        // fake mouse


        public void mouse_button_down(int num)
        {
            buttons |= (byte)(1 << num);
        }

        public void mouse_button_up(int num)
        {
            buttons &= (byte)((1 << num) ^ 0xff);
        }

        public void mouse_move(int x, int y)
        {
            mouse_x = (ushort)x;
            mouse_y = (ushort)y;
        }

        public byte mouse_read(byte reg)
        {
            switch (reg)
            {
                case 0:
                    return (byte)(mouse_x & 0xff);
                case 1:
                    return (byte)(mouse_x >> 8);
                case 2:
                    return (byte)(mouse_y & 0xff);
                case 3:
                    return (byte)(mouse_y >> 8);
                case 4:
                    return buttons;
                default:
                    return 0xff;
            }
        }

        #endregion

        private int parity(byte b)
        {
            b ^= (byte)(b >> 4);
            b ^= (byte)(b >> 2);
            b ^= (byte)(b >> 1);
            return b & 1;
        }

        public byte GetValueForViaPB(byte via2reg2)
        {
            throw new NotImplementedException();
        }

        public void SetDataFromViaPB(byte via2reg0, byte via2reg2)
        {
            throw new NotImplementedException();
        }

        public void MouseButtonDown(int num)
        {
            buttons = (byte)(buttons | 1 << num);
        }

        public void MouseButtonUp(int num)
        {
            buttons = (byte)(buttons & (1 << num) ^ 0xff);
        }

        public void MouseMove(int x, int y)
        {
        }
    }
}
