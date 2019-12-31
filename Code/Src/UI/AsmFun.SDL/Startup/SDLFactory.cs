#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Startup;
using AsmFun.UI.Startup;
using AsmFun.WebServer.Startup;
using AsmFun.WPF.EnvTools;
using System;
using System.Runtime.InteropServices;

namespace AsmFun.WPF
{

    internal class SDLFactory : IDisposable
    {

        private WebServerThread webServerThread;
        private SDLThread windowsUIThread;
        private StartupUI startupUI;

        public static int DualScreenXOffset = 0;
        public static int ConsoleWidth = 0;
        public static int ConsoleHeight = 0;


        internal SDLFactory(string[] args)
        {
            startupUI = new StartupUI();
            var container = startupUI.Init();
            new SDLServiceRegisterer().Configure(container);
            webServerThread = new WebServerThread(container);
            windowsUIThread = new SDLThread(container);
        }

        internal void Launch()
        {
            MoveConsoleToOtherScreen();
            webServerThread.Start();
            startupUI.Start();
            startupUI.Dispose();
            webServerThread.Dispose();
            windowsUIThread.Dispose();
        }

        private void MoveConsoleToOtherScreen()
        {
#if WINDOWS
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            { 
                ConsoleWidth = 800;
                ConsoleHeight = 400;
                var tools = new ConsoleTools();
                var displays = tools.GetDisplays();
                if (displays.Count > 1)
                {
                    DualScreenXOffset = displays[0].ScreenWidth;
                    new ConsoleTools().SetWindowPosition(DualScreenXOffset + 20, 10, ConsoleWidth, ConsoleHeight);
                }
            }
#endif
        }

        public void Dispose()
        {
            startupUI?.Dispose();
            webServerThread?.Dispose();
            windowsUIThread?.Dispose();
        }

    }
}