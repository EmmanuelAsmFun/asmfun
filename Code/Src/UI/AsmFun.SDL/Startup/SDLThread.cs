#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.Managers;
using System.Runtime.InteropServices;
using System.Threading;
using System.Threading.Tasks;

namespace AsmFun.Startup
{
    internal class SDLThread
    {
        private Thread thread;
        private SDLWindow sdlWindow;
        private readonly IEmServiceResolverFactory container;
        private bool isDisposed;

        public SDLThread(IEmServiceResolverFactory container)
        {
            this.container = container;
            container.Resolve<IComputerManager>().OnInitDisplay += (o, e) => {
                // Fix for linux, we need to run on a new task
                Task.Run(() => {
                    Task.Delay(1000).Wait();
                    StartComputerWindow();
                });
            };
        }

        private void StartComputerWindow()
        {
            if (isDisposed) return;
            if (thread?.ThreadState == ThreadState.Running)
                return;
            thread = new Thread(new ThreadStart(StartWindow));
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                thread.SetApartmentState(ApartmentState.STA);
            thread.Start();
        }

        private void StartWindow()
        {
            if (isDisposed) return;
            sdlWindow = new SDLWindow();
            sdlWindow.Container = container;
            sdlWindow.Init();
            sdlWindow.Start();
            sdlWindow?.Dispose();
        }

        public void Dispose()
        {
            if (isDisposed) return;
            isDisposed = true;
            sdlWindow?.Dispose();
            if (thread != null)
            {
                if (thread.ThreadState == ThreadState.Running)
                    thread.Join(2000);
            }
        }
    }
}

