using AsmFun.Computer.Common.IO;
using AsmFun.Computer.Common.IO.Data;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Threading;

namespace AsmFun.Startup
{
    /// <summary>
    /// Important: the get stats must be run from the init thread.
    /// </summary>
    public class SDLJoystickReader : IJoystickReader
    {
        private bool isDisposed;
        List<IntPtr> joySticks = new List<IntPtr>();
        List<JoystickState> joyStickStates = new List<JoystickState>();
        public int NumJoysticks { get { return joySticks.Count; } }

        public SDLJoystickReader()
        {

        }

        public void Init()
        {
            for (int i = 0; i < SDL2.SDL.SDL_NumJoysticks(); i++)
            {
                if (SDL2.SDL.SDL_IsGameController(i) == SDL2.SDL.SDL_bool.SDL_TRUE)
                {
                    IntPtr control = IntPtr.Zero;
                    try
                    {
                        control = SDL2.SDL.SDL_GameControllerOpen(i);
                        // Ensure it's working
                        var ok = SDL2.SDL.SDL_GameControllerGetButton(control, SDL2.SDL.SDL_GameControllerButton.SDL_CONTROLLER_BUTTON_A);
                        joySticks.Add(control);
                        joyStickStates.Add(new JoystickState());
                        UpdateStates();
                    }
                    catch (Exception)
                    {
                        Marshal.FreeHGlobal(control);
                    }
                }
            }
            isDisposed = false;
        }

        /// <summary>
        /// Must be run from the init thread.
        /// </summary>
        public void UpdateStates()
        {
            if (isDisposed) return;
            for (int i = 0; i < joySticks.Count; i++)
            {
                var state = joyStickStates[i];
                var control = joySticks[i];
                state.AState = SDL2.SDL.SDL_GameControllerGetButton(control, SDL2.SDL.SDL_GameControllerButton.SDL_CONTROLLER_BUTTON_A) > 0;
                state.BState = SDL2.SDL.SDL_GameControllerGetButton(control, SDL2.SDL.SDL_GameControllerButton.SDL_CONTROLLER_BUTTON_B) > 0;
                state.BackState = SDL2.SDL.SDL_GameControllerGetButton(control, SDL2.SDL.SDL_GameControllerButton.SDL_CONTROLLER_BUTTON_BACK) > 0;
                state.StartState = SDL2.SDL.SDL_GameControllerGetButton(control, SDL2.SDL.SDL_GameControllerButton.SDL_CONTROLLER_BUTTON_A) > 0;
                state.UpState = SDL2.SDL.SDL_GameControllerGetButton(control, SDL2.SDL.SDL_GameControllerButton.SDL_CONTROLLER_BUTTON_DPAD_UP) > 0;
                state.DownState = SDL2.SDL.SDL_GameControllerGetButton(control, SDL2.SDL.SDL_GameControllerButton.SDL_CONTROLLER_BUTTON_DPAD_DOWN) > 0;
                state.LeftState = SDL2.SDL.SDL_GameControllerGetButton(control, SDL2.SDL.SDL_GameControllerButton.SDL_CONTROLLER_BUTTON_DPAD_LEFT) > 0;
                state.RightState = SDL2.SDL.SDL_GameControllerGetButton(control, SDL2.SDL.SDL_GameControllerButton.SDL_CONTROLLER_BUTTON_DPAD_RIGHT) > 0;
                state.XState = SDL2.SDL.SDL_GameControllerGetButton(control, SDL2.SDL.SDL_GameControllerButton.SDL_CONTROLLER_BUTTON_X) > 0;
                state.YState = SDL2.SDL.SDL_GameControllerGetButton(control, SDL2.SDL.SDL_GameControllerButton.SDL_CONTROLLER_BUTTON_Y) > 0;
                state.LState= SDL2.SDL.SDL_GameControllerGetButton(control, SDL2.SDL.SDL_GameControllerButton.SDL_CONTROLLER_BUTTON_LEFTSHOULDER) > 0;
                state.RState= SDL2.SDL.SDL_GameControllerGetButton(control, SDL2.SDL.SDL_GameControllerButton.SDL_CONTROLLER_BUTTON_RIGHTSHOULDER) > 0;
            }
        }
        public JoystickState GetStates( int index)
        {
            return joyStickStates[index];
        }






        public void Dispose()
        {
            if (isDisposed) return;
            isDisposed = true;
            try
            {
                // ensure processor is not reading
                Thread.Sleep(50);
                //joySticks.ForEach(j => SDL2.SDL.SDL_JoystickClose(j));
            }
            catch (Exception)
            {
            }
           
                
            joyStickStates = new List<JoystickState>();
            joySticks = new List<IntPtr>();
        }
    }
}
