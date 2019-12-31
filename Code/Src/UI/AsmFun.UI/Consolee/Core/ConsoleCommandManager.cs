#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.UI.Consolee.Controls;
using System;
using System.Runtime.InteropServices;

namespace AsmFun.UI.Consolee.Core
{
    internal class BezCommandMenuHelperExtern
    {
        [DllImport("User32.Dll", EntryPoint = "PostMessageA")]
        internal static extern bool PostMessage(IntPtr hWnd, uint msg, int wParam, int lParam);
        // P/Invoke:
        internal enum StdHandle { Stdin = -10, Stdout = -11, Stderr = -12 };
        [DllImport("kernel32.dll")]
        internal static extern IntPtr GetStdHandle(StdHandle std);
        [DllImport("kernel32.dll")]
        internal static extern bool CloseHandle(IntPtr hdl);
    }
    public interface IConsoleCommandManager : IDisposable
    {
        bool IsRunning { get; set; }
        void Start();
        void Stop();
    }

    public class ConsoleCommandManager<TControlActivationManager> : IConsoleCommandManager
        where TControlActivationManager : IControlActivationManager
    {
        const int VK_RETURN = 0x0D;
        const int WM_KEYDOWN = 0x100;

        private TControlActivationManager ControlManager { get; set; }
        public bool IsRunning { get; set; }

        public ConsoleCommandManager(TControlActivationManager controlManager)
        {
            ControlManager = controlManager;
        }

        public void Start()
        {
            IsRunning = true;
            ControlManager.ActivateLastControl();
            ReadLine();
        }
        public void Stop()
        {
            IsRunning = false;
            if (!RuntimeInformation.IsOSPlatform(OSPlatform.Windows)) return;
#if WINDOWS
            try
            {
                var hWnd = System.Diagnostics.Process.GetCurrentProcess().MainWindowHandle;
                BezCommandMenuHelperExtern.PostMessage(hWnd, WM_KEYDOWN, VK_RETURN, 0);
                //IntPtr stdin = BezCommandMenuHelperExtern.GetStdHandle(BezCommandMenuHelperExtern.StdHandle.Stdin);
                //BezCommandMenuHelperExtern.CloseHandle(stdin);
            }
            catch (Exception)
            {
            }
#endif
        }



        private void ReadLine()
        {
            for (; ; )
            {
                try
                {
                    if (!IsRunning) return;
                    ConsoleKeyInfo key = Console.ReadKey(true);
                    if (!IsRunning) return;
                    switch (key.Key)
                    {
                        case ConsoleKey.UpArrow:
                            SelectCommand(ConsoleCommand.Up, key);
                            continue;
                        case ConsoleKey.DownArrow:
                            SelectCommand(ConsoleCommand.Down, key);
                            continue;
                        case ConsoleKey.LeftArrow:
                            SelectCommand(ConsoleCommand.Left, key);
                            continue;
                        case ConsoleKey.RightArrow:
                            SelectCommand(ConsoleCommand.Right, key);
                            continue;
                        case ConsoleKey.F12:
                            SelectCommand(ConsoleCommand.Quit, key);
                            continue;
                        case ConsoleKey.F5:
                            SelectCommand(ConsoleCommand.Select, key);
                            continue;
                        case ConsoleKey.Escape:
                            SelectCommand(ConsoleCommand.Back, key);
                            continue;
                        case ConsoleKey.F11:
                            SelectCommand(ConsoleCommand.Redraw, key);
                            continue;
                        case ConsoleKey.Enter:
                            SelectCommand(ConsoleCommand.Confirm, key);
                            continue;
                        case ConsoleKey.PageUp:
                            SelectCommand(ConsoleCommand.PageUp, key);
                            continue;
                        case ConsoleKey.PageDown:
                            SelectCommand(ConsoleCommand.PageDown, key);
                            continue;
                        default:
                            SelectCommand(ConsoleCommand.Unknown, key);
                            continue;
                    }
                }
                catch (Exception ex)
                {
                    ControlManager.ShowError(ex);
                }
            }
        }

        private void SelectCommand(ConsoleCommand command, ConsoleKeyInfo key)
        {
            if (ControlManager.Interterpret(key, command)) return;
            switch (command)
            {
                case ConsoleCommand.Back:
                    GoBack();
                    return;
                    //case ConsoleCommand.Quit:
                    //    GoBack();
                    //    GoBack();
                    //    GoBack();
                    //    GoBack();
                    //    GoBack();
                    //    GoBack();
                    //    Stop();
                    //    return;
            }
        }

        private void GoBack()
        {
            if (!ControlManager.PreviousControl())
            {
                // terminated no contrls anymore. Exit
                IsRunning = false;
            }
        }


#region IDisposable


        public void Dispose()
        {
            IsRunning = false;
            Stop();
        }
#endregion
    }
}
