#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Logging;
using System;


namespace AsmFun.WebServer.Startup
{
    public class ProgramWebServer : IDisposable
    {
        IWebHost server;
        private IEmServiceResolverFactory container;

        public ProgramWebServer(IEmServiceResolverFactory container, WebServerOptions options)
        {
            WebServerConfiguration.Options = options;
            WebServerConfiguration.EmContainer = container;
            this.container = container;
        }

        public void Start() { 
            
            Console.WriteLine("Starting Web server on port " + 5001);
            server = WebHost.CreateDefaultBuilder()
                .ConfigureLogging(logging =>
                {
                    logging.SetMinimumLevel(LogLevel.Error);
                    logging.ClearProviders();
                })
                .UseUrls("http://localhost:" + WebServerConfiguration.Options.Port)
                .UseStartup<WebServerConfiguration>()
                .Build();
            server.Run();
        }

        public void Dispose()
        {
            if (server != null)
            {
                server.StopAsync().GetAwaiter().GetResult();
                server = null;
            }
        }
    }
}
