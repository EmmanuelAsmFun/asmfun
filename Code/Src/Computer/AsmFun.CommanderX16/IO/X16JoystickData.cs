// Heavely inspired from https://github.com/commanderx16/x16-emulator


using AsmFun.Computer.Common.IO;
using System;

namespace AsmFun.CommanderX16.IO
{
    public class X16JoystickData : JoystickData
    {
        public enum JoystickMode
        {
            NES = 0,
            NONE = 1,
            SNES = 0xF
        }

        private const int JOY_LATCH_MASK = 0x08;
        private const int JOY_DATA1_MASK = 0x10;
        private const int JOY_CLK_MASK = 0x20;
        private const int JOY_DATA2_MASK = 0x40;
        private readonly IJoystickReader joystickReader;
        public JoystickMode joy1_mode = JoystickMode.NONE;
        public JoystickMode joy2_mode = JoystickMode.NONE;


        private int joystick1 = 0;
        private int joystick2 = 1;
        private bool old_clock = false;
        private bool writing = false;
        private ushort joystick1_state = 0;
        private ushort joystick2_state = 0;
        private byte clock_count = 0;

        private bool joystick_latch;
        private bool joystick_clock;
        private bool joystick1_data;
        private bool joystick2_data;

        public X16JoystickData(IJoystickReader joystickReader)
        {
            this.joystickReader = joystickReader;
        }

        internal byte GetValueForVia(byte value)
        {
            return (byte)(value | (joystick1_data ? JOY_DATA1_MASK : 0) | (joystick2_data ? JOY_DATA2_MASK : 0));
        }

        internal void SetDataFromVia(byte via2reg1)
        {
            joystick_latch = (via2reg1 & JOY_LATCH_MASK) > 0;
            joystick_clock = (via2reg1 & JOY_CLK_MASK) > 0;
        }

        public void Step()
        {
            if (joystickReader.NumJoysticks == 0) return;
            if (!writing)
            { //if we are not already writing, check latch to
              //see if we need to start
                handle_latch(joystick_latch, joystick_clock);
                return;
            }

            //if we have started writing controller data and the latch has dropped,
            // we need to start the next bit
            if (!joystick_latch)
            {
                //check if clock has changed
                if (joystick_clock != old_clock)
                {
                    if (old_clock)
                    {
                        old_clock = joystick_clock;
                    }
                    else
                    { //only write next bit when the new clock is high
                        clock_count += 1;
                        old_clock = joystick_clock;
                        if (clock_count < 16)
                        { // write out the next 15 bits
                            joystick1_data = (joy1_mode != JoystickMode.NONE) ? (joystick1_state & 1) != 0 : true;
                            joystick2_data = (joy2_mode != JoystickMode.NONE) ? (joystick2_state & 1) != 0 : true;
                            joystick1_state = (ushort)(joystick1_state >> 1);
                            joystick2_state = (ushort)(joystick2_state >> 1);
                        }
                        else
                        {
                            //Done writing controller data
                            //reset flag and set count to 0
                            writing = false;
                            clock_count = 0;
                            joystick1_data = (joy1_mode != JoystickMode.NONE) ? false : true;
                            joystick2_data = (joy2_mode != JoystickMode.NONE) ? false : true;
                        }
                    }
                }
            }



        }

        private bool handle_latch(bool latch, bool clock)
        {
            if (latch)
            {
                clock_count = 0;
                //get the 16-representation to put to the VIA
                joystick1_state = GetJoystickState(joystick1, joy1_mode);
                joystick2_state = GetJoystickState(joystick2, joy2_mode);
                //set writing flag to true to signal we will start writing controller data
                writing = true;
                old_clock = clock;
                //preload the first bit onto VIA
                joystick1_data = (joy1_mode != JoystickMode.NONE) ? (joystick1_state & 1) != 0 : true;
                joystick2_data = (joy2_mode != JoystickMode.NONE) ? (joystick2_state & 1) != 0 : true;
                joystick1_state = (ushort)(joystick1_state >> 1);
                joystick2_state = (ushort)(joystick2_state >> 1);
            }

            return latch;
        }

        private ushort GetJoystickState(int index, JoystickMode mode)
        {
            if ( index >= joystickReader.NumJoysticks) return 0xFFFF;
            var state = joystickReader.GetStates(index);
            //if (state.UpState) Console.WriteLine("Joystick:Up");
            //if (state.DownState) Console.WriteLine("Joystick:Down");
            //if (state.LeftState) Console.WriteLine("Joystick:Left");
            //if (state.RightState) Console.WriteLine("Joystick:Right");
            //if (state.AState) Console.WriteLine("Joystick:A");
            //if (state.BState) Console.WriteLine("Joystick:B");
            //if (state.XState) Console.WriteLine("Joystick:X");
            //if (state.YState) Console.WriteLine("Joystick:Y");
            //if (state.LState) Console.WriteLine("Joystick:L");
            //if (state.RState) Console.WriteLine("Joystick:R");
            //if (state.BackState) Console.WriteLine("Joystick:Back");
            //if (state.StartState) Console.WriteLine("Joystick:Start");
            if (mode == JoystickMode.NES)
            {
                return (ushort)(
                    (!state.AState) ? 1 : 0 |
                    ((!state.BState) ? 1 : 0) << 1 |
                    ((!state.BackState) ? 1 : 0) << 2 |
                    ((!state.StartState) ? 1 : 0) << 3 |
                    ((!state.UpState) ? 1 : 0) << 4 |
                    ((!state.DownState) ? 1 : 0) << 5 |
                    ((!state.LeftState) ? 1 : 0) << 6 |
                    ((!state.RightState) ? 1 : 0) << 7 |
                    0x0000);
            }
            if (mode == JoystickMode.SNES)
            {
                // reverse B and A
                return (ushort)(
                    (!state.AState) ? 1 : 0 |
                    ((!state.YState) ? 1 : 0) << 1 |
                    ((!state.BackState) ? 1 : 0) << 2 |
                    ((!state.StartState) ? 1 : 0) << 3 |
                    ((!state.UpState) ? 1 : 0) << 4 |
                    ((!state.DownState) ? 1 : 0) << 5 |
                    ((!state.LeftState) ? 1 : 0) << 6 |
                    ((!state.RightState) ? 1 : 0) << 7 |
                    ((!state.BState) ? 1 : 0) << 8 |
                    ((!state.XState) ? 1 : 0) << 9 |
                    ((!state.LState) ? 1 : 0) << 10 |
                    ((!state.RState) ? 1 : 0) << 11 |
                   0x0000);
            }
            return 0xFFFF;
        }
    }
}