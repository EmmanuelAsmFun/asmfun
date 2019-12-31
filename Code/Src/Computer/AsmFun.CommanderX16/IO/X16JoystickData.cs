// Heavely inspired from https://github.com/commanderx16/x16-emulator


using AsmFun.Computer.Common.IO;
using System;

namespace AsmFun.CommanderX16.IO
{
    public class X16JoystickData : JoystickData
    {
        public enum joy_status
        {
            NES = 0,
            NONE = 1,
            SNES = 0xF
        }

        private const int JOY_LATCH_MASK = 0x08;
        private const int JOY_DATA1_MASK = 0x10;
        private const int JOY_CLK_MASK = 0x20;
        private const int JOY_DATA2_MASK = 0x40;


        public joy_status joy1_mode = joy_status.NONE;
        public joy_status joy2_mode = joy_status.NONE;


        private IntPtr joystick1;
        private IntPtr joystick2;
        private bool old_clock = false;
        private bool writing = false;
        private ushort joystick1_state = 0;
        private ushort joystick2_state = 0;
        private byte clock_count = 0;

        private bool joystick_latch;
        private bool joystick_clock;
        private bool joystick1_data;
        private bool joystick2_data;

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
                            joystick1_data = (joy1_mode != joy_status.NONE) ? (joystick1_state & 1) != 0 : true;
                            joystick2_data = (joy2_mode != joy_status.NONE) ? (joystick2_state & 1) != 0 : true;
                            joystick1_state = (ushort)(joystick1_state >> 1);
                            joystick2_state = (ushort)(joystick2_state >> 1);
                        }
                        else
                        {
                            //Done writing controller data
                            //reset flag and set count to 0
                            writing = false;
                            clock_count = 0;
                            joystick1_data = (joy1_mode != joy_status.NONE) ? false : true;
                            joystick2_data = (joy2_mode != joy_status.NONE) ? false : true;
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
                joystick1_state = get_joystick_state(joystick1, joy1_mode);
                joystick2_state = get_joystick_state(joystick2, joy2_mode);
                //set writing flag to true to signal we will start writing controller data
                writing = true;
                old_clock = clock;
                //preload the first bit onto VIA
                joystick1_data = (joy1_mode != joy_status.NONE) ? (joystick1_state & 1) != 0 : true;
                joystick2_data = (joy2_mode != joy_status.NONE) ? (joystick2_state & 1) != 0 : true;
                joystick1_state = (ushort)(joystick1_state >> 1);
                joystick2_state = (ushort)(joystick2_state >> 1);
            }

            return latch;
        }

        private ushort get_joystick_state(IntPtr control, joy_status mode)
        {


            return 0xFFFF;
        }
    }
}