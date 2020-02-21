#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.Computer;
using AsmFun.WPF.TheWPF;
using System;
using System.Runtime.InteropServices;
using System.Threading;

namespace AsmFun.WPF.Startup
{
    public class WindowsUIThread : IDisposable
    {
        private Thread windowThread;
        private App app;
        private RootHiddenWindow rootHiddenWindow;
        private readonly IEmServiceResolverFactory container;
        private bool isDisposed;

        public WindowsUIThread(IEmServiceResolverFactory container)
        {
            this.container = container;
            container.Resolve<IComputerManager>().OnInitDisplay += (o, e) => StartComputerWindow();
            windowThread = new Thread(new ThreadStart(StartWindow));
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                windowThread.SetApartmentState(ApartmentState.STA);
        }

        public void Start()
        {
            windowThread.Start();
        }

        private void StartComputerWindow()
        {
            if (isDisposed) return;
            if (windowThread.ThreadState == ThreadState.Running)
            {
                rootHiddenWindow.OpenMainWindow();
                return;
            }
        }

        private void StartWindow()
        {
            if (isDisposed) return;
            if (app == null)
                app = new App();
            rootHiddenWindow = new RootHiddenWindow();
            rootHiddenWindow.Container = container;
            app.Run(rootHiddenWindow);
        }

        public void Dispose()
        {
            if (isDisposed) return;
            isDisposed = true;
            rootHiddenWindow?.RequestClose();
            if (windowThread != null)
            {
                if (windowThread.ThreadState == ThreadState.Running)
                    windowThread.Join(2000);
            }
        }
    }
}
