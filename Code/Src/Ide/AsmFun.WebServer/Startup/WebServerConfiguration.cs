#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using System.Collections.Generic;
using System.IO;

namespace AsmFun.WebServer.Startup
{
    internal class WebServerConfiguration
    {
        public IConfiguration Configuration { get; }
        public static WebServerOptions Options { get; internal set; }
        public static IEmServiceResolverFactory EmContainer { get; internal set; }

        public WebServerConfiguration(IConfiguration configuration)
        {
            Configuration = configuration;
        }


        readonly string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";
        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            //services.AddCors(options =>
            //{
            //    options.AddPolicy(MyAllowSpecificOrigins,
            //    builder =>
            //    {
            //        builder
            //            .WithOrigins("http://localhost:5001",
            //                                "https://asmfun.com",
            //                                "https://localhost:50265"
            //                                )
            //            .AllowAnyMethod()
            //            .AllowAnyHeader();
            //    });
            //});
            services.AddMvc(re => {
                re.EnableEndpointRouting = false;

            });
            RegisterServices.Register(services, EmContainer);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            var withStaticFiles = Directory.Exists(Options.WwwFolder) ;
            
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseBrowserLink();
            }
            else
            {
                app.UseExceptionHandler("/Error");
            }
            app.UseMiddleware(typeof(CorsMiddleware));
           
            //app.UseCors(MyAllowSpecificOrigins);
            app.UseMvc(routes =>
            {
                routes.MapRoute("default", "Api/{controller=Home}/{action=Index}/{id?}");
            });
            
            if (withStaticFiles)
            {
                string defaultFiles = "index.html,default.htm,default.html";

                app.UseDefaultFiles(new DefaultFilesOptions
                {
                    FileProvider = new PhysicalFileProvider(Options.WwwFolder),
                    DefaultFileNames = new List<string>(defaultFiles.Split(',', ';')),
                });

                app.UseStaticFiles(new StaticFileOptions
                {
                    FileProvider = new PhysicalFileProvider(Options.WwwFolder),
                    RequestPath = "",
                    OnPrepareResponse = p => {
                        p.Context.Response.Headers.Add("Set-Cookie", "HttpOnly;Secure;SameSite=Strict");
                        //p.Context.Response.Headers.Add("Access-Control-Allow-Origin", "*");
                        //p.Context.Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
                        //p.Context.Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");
                        //p.Context.Response.Headers.Add("Access-Control-Allow-Credentials", "true");
                    }
                });
            }
        }

      
    }
}

