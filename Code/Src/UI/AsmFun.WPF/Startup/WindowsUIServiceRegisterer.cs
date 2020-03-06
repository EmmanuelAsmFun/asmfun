#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion


using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.IO;
using AsmFun.Ide.Core.Features.Files;
using AsmFun.NetCore.Startup;
using AsmFun.Startup;
using AsmFun.WPF.EnvTools;

namespace AsmFun.WPF.Startup
{
    internal class WindowsUIServiceRegisterer
    {
        public void Configure(IEmServiceResolverFactory container)
        {
            new AsmNetCoreRegisterer().Configure(container);
            container.Add<IFileSelectorPopup, FileSelectorPopup>();
            container.Add<IJoystickReader, DirectXJoystickReader>();
        }
    }
}
