#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.UI.Startup;
using AsmFun.WebServer.Startup;
using AsmFun.WPF.EnvTools;
using AsmFun.WPF.Startup;
using System;

namespace AsmFun.WPF
{

    internal class WindowsUIFactory : IDisposable
    {
       
        private WebServerThread webServerThread;
        private WindowsUIThread windowsUIThread;
        private StartupUI startupUI;

        public static int DualScreenXOffset = 0;
        public static int ConsoleWidth = 0;
        public static int ConsoleHeight = 0;


        internal WindowsUIFactory(string[] args)
        {
            startupUI = new StartupUI();
            var container = startupUI.Init();
            new WindowsUIServiceRegisterer().Configure(container);
            webServerThread = new WebServerThread(container);
            windowsUIThread = new WindowsUIThread(container);
        }

        internal void Launch()
        {
            MoveConsoleToOtherScreen();
            webServerThread.Start();
            windowsUIThread.Start();
            startupUI.Start();
            startupUI.Dispose();
            webServerThread.Dispose();
            windowsUIThread.Dispose();
        }

        private void MoveConsoleToOtherScreen()
        {
#if DEBUG
            ConsoleWidth = 800;
            ConsoleHeight = 400;
            var tools = new ConsoleTools();
            var displays = tools.GetDisplays();
            if (displays.Count > 1)
            {
                DualScreenXOffset = displays[0].ScreenWidth;
                if (displays.Count > 2)
                    DualScreenXOffset = displays[0].ScreenWidth + displays[1].ScreenWidth;
                new ConsoleTools().SetWindowPosition(DualScreenXOffset+ 20, 10, ConsoleWidth, ConsoleHeight);
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
