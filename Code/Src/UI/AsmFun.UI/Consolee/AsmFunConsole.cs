#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.Computer;
using AsmFun.Ide;
using AsmFun.Ide.Common.Features.Ide;
using AsmFun.Ide.Common.Features.Projects;
using AsmFun.UI.Consolee.Controls;
using AsmFun.UI.Consolee.UI;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

namespace AsmFun.UI.Consolee
{
    public class AsmFunConsole
    {
        private static bool isclosing;
        private readonly IEmServiceResolver container;
        ConsolePainter painter;
        ConsoleStyleSheet styleSheet;

        public bool IsRunning { get; set; } = true;

        public AsmFunConsole(IEmServiceResolver container)
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                SetConsoleCtrlHandler(ConsoleCtrlCheck, true);
            this.container = container;
            painter = new ConsolePainter();
            styleSheet = new ConsoleStyleSheet();
            painter.MenuWidth = 50;
        }

        public void Start()
        {
            Console.Title = "ASM Fun Control";
            ShowMenu();
            Task.Run(() =>
            {
                Task.Delay(1000).Wait();
                Redraw();
                Task.Delay(3000).Wait();
                Redraw();
            });

            while (IsRunning && !isclosing)
            {
                try
                {
                    var cursorReader = new ConsoleCursorReader(page.PageUI);
                    string result;
                    if (!cursorReader.TryReadLine(out result))
                    {
                    }
                    mainMenu.Interterpret(cursorReader.Command);
                }
                catch (Exception e)
                {
                    page.ShowError(e);
                }
            }
        }

        private void LaunchComputer()
        {
            var computerManager = container.Resolve<IComputerManager>();
            var computer = computerManager.GetComputer();
            if (computer != null || (computer != null && computer.IsRunning)) return;
            var userSettings = container.Resolve<IUserSettingsDA>().Get();
            computerManager.BuildComputer(userSettings.ComputerSettings);
            computerManager.StartComputer(GetProgram());
            Redraw();
        }
        private void LoadProgram()
        {
            var computerManager = container.Resolve<IComputerManager>();
            computerManager.LoadProgramInPc(GetProgram());
            Redraw();
        }

        private string GetProgram()
        {
            var projectManager = container.Resolve<IProjectManager>();
            var buildConfiguration = projectManager.GetBuildConfiguration();
            if (buildConfiguration == null) return null;
            var programFileName = Path.GetFileNameWithoutExtension(buildConfiguration.ProgramFileName.Trim(Path.DirectorySeparatorChar));
            var settings = projectManager.GetCurrentProjectSettings();
            programFileName = Path.Combine(settings.Folder, buildConfiguration.OutputFolderName, programFileName +".prg");
            return programFileName;
            //var projectManager = container.Resolve<IProjectManager>();
            //var buildConfiguration = projectManager.GetBuildConfiguration();
            //var programName = buildConfiguration?.ProgramFileName;
            //if (string.IsNullOrWhiteSpace(programName)) return null;
            //var settings = projectManager.GetCurrentProjectSettings();
            //var fullPathName = System.IO.Path.Combine(settings.Folder, programName.Trim('\\').Trim('/'));
            //return fullPathName;
        }

        private void Quit()
        {
            IsRunning = false;
            var hWnd = System.Diagnostics.Process.GetCurrentProcess().MainWindowHandle;
            PostMessage(hWnd, WM_KEYDOWN, VK_RETURN, 0);
        }
        private void LaunchIde()
        {
            OpenUrl("http://localhost:5001");
            Redraw();
        } 
        private void LaunchOnlineIde()
        {
            OpenUrl("http://asmfun.com");
            Redraw();
        }

        private void Redraw()
        {
            page.Redraw();
            RedrawPcData();
        }

        private void RedrawPcData()
        {
            var computerManager = container.Resolve<IComputerManager>();
            var computer = computerManager.GetComputer();
            if (computer == null || !computer.IsRunning) return;
            var data = computer.GetProcessorData();
            var x = 40;
            var y = 3;
            // todo: better berformance with ComputerType
            page.PageUI.ConsolePainter.DrawBox(page.PageUI.StyleSheet, computer.GetSetupSettings()?.ComputerType.ToString(), x, y, 38, 10);
            page.PageUI.ConsolePainter.DrawText("PC " + data.ProgramCounter.ToString("X4"), x + 1, y + 1);
            page.PageUI.ConsolePainter.DrawText("A  " + data.RegisterA.ToString("X2"), x + 1, y + 2);
            page.PageUI.ConsolePainter.DrawText("X  " + data.RegisterX.ToString("X2"), x + 1, y + 3);
            page.PageUI.ConsolePainter.DrawText("Y  " + data.RegisterY.ToString("X2"), x + 1, y + 4);
        }

        private PageControl page;
        private Data.ConsoleMenuData mainMenu;

        private void ShowMenu()
        {
            if (page == null)
            {
                mainMenu = new Data.ConsoleMenuData();
                mainMenu.Title = "Menu";
                mainMenu.AddRangeOnce(new List<Data.ConsoleMenuItemData> {
                new Data.ConsoleMenuItemData{Id="0", Title= "Redraw",Action= () => Redraw()},
                new Data.ConsoleMenuItemData{Id="1", Title= "Launch local IDE with SourceCode",Action= () => LaunchIde()},
                new Data.ConsoleMenuItemData{Id="2", Title= "Launch Online IDE",Action= () => LaunchOnlineIde()},
                new Data.ConsoleMenuItemData{Id="3", Title= "Start CommanderX16",Action= () => LaunchComputer()},
                new Data.ConsoleMenuItemData{Id="4", Title= "Load Current Program",Action= () => LoadProgram()},
                new Data.ConsoleMenuItemData{Id="5", Title= "Quit",Action= () => Quit()},
            });
                page = new PageControl();
                page.Create();
                page.Init();
                page.Title = "ASMFun Server";
                page.SubTitle = "V"+Assembly.GetEntryAssembly().GetName().Version.ToString();
                page.PageUI.AddMenu(mainMenu);
                mainMenu.ConsoleVMenuUI.StartX = 3;
                mainMenu.ConsoleVMenuUI.StartY = 3;
                mainMenu.ConsoleVMenuUI.Width = 30;
                mainMenu.ConsoleVMenuUI.Height = 6;
                page.Activate();
                page.Start();
                mainMenu.Activate();
                mainMenu.Interterpret(ConsoleCommand.Down);
            }
            page.Activate();
            mainMenu.Activate();
            Redraw();
        }

        #region unmanaged
        const int VK_RETURN = 0x0D;
        const int WM_KEYDOWN = 0x100;

        private static bool ConsoleCtrlCheck(CtrlTypes ctrlType)
        {
            // Put your own handler here
            switch (ctrlType)
            {
                case CtrlTypes.CTRL_CLOSE_EVENT:
                    isclosing = true;
                    var hWnd = System.Diagnostics.Process.GetCurrentProcess().MainWindowHandle;
                    PostMessage(hWnd, WM_KEYDOWN, VK_RETURN, 0);
                    break;
            }
            return true;
        }


        // Declare the SetConsoleCtrlHandler function
        // as external and receiving a delegate.
        [DllImport("Kernel32")]
        public static extern bool SetConsoleCtrlHandler(HandlerRoutine Handler, bool Add);

        // A delegate type to be used as the handler routine
        // for SetConsoleCtrlHandler.
        public delegate bool HandlerRoutine(CtrlTypes CtrlType);

        // An enumerated type for the control messages
        // sent to the handler routine.
        public enum CtrlTypes
        {
            CTRL_C_EVENT = 0,
            CTRL_BREAK_EVENT,
            CTRL_CLOSE_EVENT,
            CTRL_LOGOFF_EVENT = 5,
            CTRL_SHUTDOWN_EVENT
        }
        [DllImport("User32.Dll", EntryPoint = "PostMessageA")]
        internal static extern bool PostMessage(IntPtr hWnd, uint msg, int wParam, int lParam);
        // P/Invoke:
        internal enum StdHandle { Stdin = -10, Stdout = -11, Stderr = -12 };
        [DllImport("kernel32.dll")]
        internal static extern IntPtr GetStdHandle(StdHandle std);
        [DllImport("kernel32.dll")]
        internal static extern bool CloseHandle(IntPtr hdl);
        #endregion


        private void OpenUrl(string url)
        {
            try
            {
                Process.Start(url);
            }
            catch
            {
                if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                {
                    url = url.Replace("&", "^&");
                    Process.Start(new ProcessStartInfo("cmd", $"/c start {url}") { CreateNoWindow = true });
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                {
                    Process.Start("xdg-open", url);
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
                {
                    Process.Start("open", url);
                }
                else
                {
                    throw;
                }
            }
        }
    }
}
