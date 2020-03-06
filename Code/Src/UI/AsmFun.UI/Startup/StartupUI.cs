#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using System.Threading;
using System.Threading.Tasks;
using AsmFun.CommanderX16.Startup;
using AsmFun.Common.ServiceLoc;
using AsmFun.Core.DataAccess;
using AsmFun.Core.ServiceLoc;
using AsmFun.Core.Startup;
using AsmFun.Computer.Startup;
using AsmFun.Ide;
using AsmFun.Ide.Startup;
using AsmFun.UI.Consolee;
using AsmFun.CommanderX16.Computer.Factories;
using AsmFun.Ide.Common.Features.Ide;
using AsmFun.Ide.Common.Features.Projects;
using AsmFun.Ide.Common.Features.Ide.Data;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Computer.EventArgss;
using System.Text;

namespace AsmFun.UI.Startup
{
    public class StartupUI : IDisposable
    {
        private bool isDisposed;
        private IEmServiceResolverFactory container;
        private IdeStartup ideStartup;
        private ComputerStartup emulatorStartup;
        private X16Startup x16Startup;
        private CoreStartup coreStartup;


        public IEmServiceResolverFactory Init()
        {
            container = new EmServiceResolverFactory();
            container.Add(container).WithLifestyle(EmServiceLifestyle.Singleton);
            container.Add<IEmServiceResolver>(container).WithLifestyle(EmServiceLifestyle.Singleton);
            container.Add<IUserSettingsDA, UserSettingsDA>().WithLifestyle(EmServiceLifestyle.Singleton);
            container.Add<StartupUI>(this).WithLifestyle(EmServiceLifestyle.Singleton);
            ideStartup = new IdeStartup();
            ideStartup.Configure(container); 
            emulatorStartup = new ComputerStartup();
            emulatorStartup.Configure(container);
            x16Startup = new X16Startup();
            x16Startup.Configure(container);
            coreStartup = new CoreStartup();
            coreStartup.Configure(container);
            return container;
        }

        public void Start()
        {
            InitializationFactories();
            LoadDefaultData();
            ideStartup.Start();
            container.Resolve<IComputerManager>().OnComputerLoaded += StartupUI_OnComputerLoaded;
            var console = new AsmFunConsole(container);
            //Task.Run(() => { Task.Delay(1000).Wait(); container.Resolve<IComputerManager>().StartComputer(); });
            console.Start();
        }

        private void StartupUI_OnComputerLoaded(object sender, ComputerEventArgs e)
        {
            // Task.Run(() =>
            // {
            //     Task.Delay(1000).Wait();
            //     var prgrm = @"D:\Projects\CommanderX64Tools\X16Computer\out\Debug\snake\output\main.prg";
            //     //var code = @"C:\Users\Emmanuel\Desktop\x16emu_win-r32\demoAsmFun\cc65-sprite\out\demo.prg";
            //     //var compiler = container.Resolve<IACMECompiler>();
            //     //compiler.Compile();
            //     //var prgrm = @"D:\Projects\CommanderX64Tools\X16Computer\out\Debug\m.prg";
            //     //container.Resolve<IComputerManager>().LoadProgramInPc(prgrm);

            // });
        }

        private void InitializationFactories()
        {
            container.Resolve<IComputerManager>()
                .AddFactory(new ComputerSettings
                {
                    ComputerType = X16ComputerFactory.ComputerTypenS,
                    ComputerVersion = X16ComputerFactoryR33.ComputerVersionS
                }, () => container.Resolve<X16ComputerFactoryR33>())
                .AddFactory(new ComputerSettings
                {
                    ComputerType = X16ComputerFactory.ComputerTypenS,
                    ComputerVersion = X16ComputerFactoryR34.ComputerVersionS
                }, () => container.Resolve<X16ComputerFactoryR34>())
                .AddFactory(new ComputerSettings
                {
                    ComputerType = X16ComputerFactory.ComputerTypenS,
                    ComputerVersion = X16ComputerFactoryR35.ComputerVersionS
                }, () => container.Resolve<X16ComputerFactoryR35>())
                .AddFactory(new ComputerSettings
                {
                    ComputerType = X16ComputerFactory.ComputerTypenS,
                    ComputerVersion = X16ComputerFactoryR36.ComputerVersionS
                }, () => container.Resolve<X16ComputerFactoryR36>())
                ;
        }

        private void LoadDefaultData()
        {
            var userSettingsDA = container.Resolve<IUserSettingsDA>();
            var userSettings = userSettingsDA.Load();
            container.Add(userSettings.IdeSettings);
            container.Add(userSettings.ComputerSettings);
            UserSettings.UpdateCompilers(container, userSettings);
            var projectManager = container.Resolve<IProjectManager>();
            projectManager.LoadLastOpened();
        }

        public void Dispose()
        {
            if (isDisposed) return;
            isDisposed = true;
            emulatorStartup?.Dispose();
            ideStartup?.Dispose();
            // Last
            container?.Dispose();
        }
    }
}
