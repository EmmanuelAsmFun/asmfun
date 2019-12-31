#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Core.Tools;
using AsmFun.Computer.Common.Video;
using System;
using System.Threading;
using System.Runtime.InteropServices;

namespace AsmFun.Computer.Core.Video
{
    public class VideoProcessor : IDisposable
    {
        private readonly IVideoAccess video;
        private bool isRunning = true;

        public VideoProcessor(IVideoAccess video)
        {
            this.video = video;
        }

        public void Start()
        {
            Thread worker = new Thread(DoWork);
            worker.IsBackground = true;
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                worker.SetApartmentState(ApartmentState.STA);
            worker.Start();
        }

        private void DoWork(object obj)
        {
            while (isRunning)
            {
                try
                {
                    // Remove try catch for performance
                   while (isRunning)
                        video.Step();
                }
                catch (Exception e)
                {
                    ConsoleHelper.WriteError<VideoProcessor>(e);
                }
            }
        }

        public void Dispose()
        {
            // Todo
            isRunning = false;
        }
    }
}
