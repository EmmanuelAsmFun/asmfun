#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using System;
using System.IO;
using System.Threading;

namespace AsmFun.WebServer.Startup
{
    public class WebServerThread : IDisposable
    {
        private readonly IEmServiceResolverFactory container;
        private Thread webThread;
        private ProgramWebServer programWebServer;
        private bool isDisposed;
        public bool IsRunning { get; private set; }
        

        public WebServerThread(IEmServiceResolverFactory container, Action<WebServerOptions> webServerOptionsModifications = null)
        {
            this.container = container;
            var webServerOptions = new WebServerOptions
            {
                Port = 5001,
                WwwFolder = GetStaticFileFolder()
            };
            webServerOptionsModifications?.Invoke(webServerOptions);

            container.Add(webServerOptions).WithLifestyle(EmServiceLifestyle.Singleton);
            programWebServer = new ProgramWebServer(container, webServerOptions);
            webThread = new Thread(StartWebServer);
            webThread.Name = "WebServerThread";
        }
        public void Start()
        {
            if (isDisposed) return;
            if (IsRunning) return;
            IsRunning = true;
            webThread.Start();
        }

        private void StartWebServer()
        {
            if (isDisposed) return;
            programWebServer.Start();
            IsRunning = false;
        }

        private string GetStaticFileFolder()
        {
            // On dev machines
            // check if the folder exists ../../../../AsmFun.HtmlEditor/wwwroot
            var devPath = "";
            try
            {
                // Windows 
                devPath = Path.Combine(
                    Directory.GetParent(Directory.GetCurrentDirectory()).Parent.Parent.Parent.Parent.FullName,
                        "Ide", "AsmFun.BrowserPages", "www");
                if (Directory.Exists(devPath))
                    return devPath;
                // Other environmnts
                devPath = Path.Combine(Directory.GetCurrentDirectory(),"Ide", "AsmFun.BrowserPages", "www");
                if (Directory.Exists(devPath))
                    return devPath;
            }
            catch
            {
                // Other environmnts
                devPath = Path.Combine(Directory.GetCurrentDirectory(),"Ide", "AsmFun.BrowserPages", "www");
                if (Directory.Exists(devPath))
                    return devPath;
            }
            var wwwFolder = Path.Combine(Directory.GetCurrentDirectory(), "www");
            return wwwFolder;
        }

        public void Dispose()
        {
            if (isDisposed) return;
            isDisposed = true;
            programWebServer?.Dispose();
            webThread?.Join(2000);
        }
    }
}
