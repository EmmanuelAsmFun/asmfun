#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using Microsoft.AspNetCore.Http;
using System.Net;
using System.Threading.Tasks;

namespace AsmFun.WebServer.Startup
{
    public class CorsMiddleware
    {
        private readonly RequestDelegate _next;

        public CorsMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
#if DEBUG
            var sett = false;
            if (context.Request.Headers.ContainsKey("origin")){
                var ori = context.Request.Headers["origin"];
                if (ori.Count > 0 && ori[0].IndexOf("localhost") > -1)
                {
                    context.Response.Headers.Add("Access-Control-Allow-Origin", "https://localhost:44343");
                    sett = true;
                }
               
            }
            if (!sett)
                context.Response.Headers.Add("Access-Control-Allow-Origin", "https://asmfun.com");
#else
            context.Response.Headers.Add("Access-Control-Allow-Origin", "https://asmfun.com");
#endif
            context.Response.Headers.Add("Access-Control-Allow-Credentials", "true");
            // Added "Accept-Encoding" to this list
            context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Accept-Encoding, Content-Length, Content-MD5, Date, X-Api-Version, X-File-Name");
            context.Response.Headers.Add("Access-Control-Allow-Methods", "POST,GET,PUT,PATCH,DELETE,OPTIONS");
            // New Code Starts here
            if (context.Request.Method == "OPTIONS")
            {
                context.Response.StatusCode = (int)HttpStatusCode.OK;
                await context.Response.WriteAsync(string.Empty);
                return;
            }
            // New Code Ends here

            await _next(context);
        }
    }
}

