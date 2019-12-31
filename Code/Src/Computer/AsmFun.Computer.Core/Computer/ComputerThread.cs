#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer.Data;
using System;
using System.Runtime.InteropServices;
using System.Threading;

namespace AsmFun.Computer.Core.Computer
{
    internal class ComputerThread : IDisposable
    {
        private Thread thread;
        private IComputer computer;
        private bool isDisposed;

        public ComputerThread()
        {
        }

        public void Start(IComputer computer)
        {
            if (isDisposed) return;
            this.computer = computer;
            if (thread?.ThreadState == ThreadState.Running)
                return;
            thread = new Thread(new ThreadStart(StartComputer));
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                thread.SetApartmentState(ApartmentState.STA);
            thread.Start();
        }

        private void StartComputer()
        {
            if (isDisposed) return;
            computer.StartComputer();
        }

        public void Dispose()
        {
            if (isDisposed) return;
            isDisposed = true;
            if (thread != null)
            {
                if (thread.ThreadState == ThreadState.Running)
                    thread.Join(2000);
            }
        }
    }
}