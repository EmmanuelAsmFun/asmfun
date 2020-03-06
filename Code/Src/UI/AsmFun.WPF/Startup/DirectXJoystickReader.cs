using AsmFun.Computer.Common.IO;
using AsmFun.Computer.Common.IO.Data;
using SharpDX.DirectInput;
using System;
using System.Collections.Generic;
using System.Threading;
using JoystickState = AsmFun.Computer.Common.IO.Data.JoystickState;

namespace AsmFun.Startup
{
    public class DirectXJoystickReader : IJoystickReader
    {
        private bool isDisposed = false;
        private List<Joystick> joysticks = new List<Joystick>();
        private List<JoystickState> joystickStates = new List<JoystickState>();
        private List<SharpDX.DirectInput.JoystickState> joystickStatesX = new List<SharpDX.DirectInput.JoystickState>();
        public int NumJoysticks { get { return joysticks.Count; } }
        private Thread readerThread;

        public DirectXJoystickReader()
        {
            

        }


        public void Init()
        {
            isDisposed = false;
            // Initialize DirectInput
            var directInput = new DirectInput();

            foreach (var deviceInstance in directInput.GetDevices(DeviceType.Gamepad, DeviceEnumerationFlags.AllDevices))
            {
                Joystick joystick = new Joystick(directInput, deviceInstance.InstanceGuid);
                // Set BufferSize in order to use buffered data.
                joystick.Properties.BufferSize = 128;

                // Acquire the joystick
                joystick.Acquire();
                joysticks.Add(joystick);
                joystickStates.Add(new JoystickState());
                joystickStatesX.Add(new SharpDX.DirectInput.JoystickState());
            }

            // If Gamepad not found, look for a Joystick
            foreach (var deviceInstance in directInput.GetDevices(DeviceType.Joystick, DeviceEnumerationFlags.AllDevices))
            {
                Joystick joystick = new Joystick(directInput, deviceInstance.InstanceGuid);
                // Acquire the joystick
                joystick.Acquire();
                joysticks.Add(joystick);
                joystickStates.Add(new JoystickState());
                joystickStatesX.Add(new SharpDX.DirectInput.JoystickState());
            }
            if (NumJoysticks > 0)
            {
                readerThread = new Thread(StartPolling);
                readerThread.IsBackground = true;
                readerThread.Start();
            }
        }
        private void StartPolling()
        {
            try
            {
                while (!isDisposed)
                {
                    UpdateStatesInternal();
                    Thread.Sleep(10);
                }
            }
            catch (Exception)
            {
            }
        }

        public JoystickState GetStates(int index)
        {
            return joystickStates[index];
        }

        public void UpdateStates() { }
        private void UpdateStatesInternal()
        {
            if (isDisposed) return;
            for (int index = 0; index < joysticks.Count; index++)
            {
                var joystick = joysticks[index];
                joystick.Poll();
                var state = joystickStates[index];
                var stateX = joystickStatesX[index];
                joystick.GetCurrentState(ref stateX);
                state.AState = stateX.Buttons[1];
                state.BState = stateX.Buttons[2];
                state.XState = stateX.Buttons[0];
                state.YState = stateX.Buttons[3];
                state.LState = stateX.Buttons[4];
                state.RState = stateX.Buttons[5];
                state.BackState = stateX.Buttons[8];
                state.StartState = stateX.Buttons[9];
                var arrows = stateX.PointOfViewControllers[0];
                var indexP = arrows / 9000;
                state.UpState = arrows == 0;
                state.RightState = indexP == 1;
                state.DownState = indexP == 2;
                state.LeftState = indexP == 3;
                
                //Console.WriteLine(arrows.ToString());
            }
        }

        public void Dispose()
        {
            isDisposed = true;
            readerThread.Join(100);
            Thread.Sleep(50);
            for (int index = 0; index < joysticks.Count; index++)
            {
                var joystick = joysticks[index];
                joystick.Dispose();
            }
            joysticks.Clear();
            joystickStates.Clear();
            joystickStatesX.Clear();
        }

    }
}
