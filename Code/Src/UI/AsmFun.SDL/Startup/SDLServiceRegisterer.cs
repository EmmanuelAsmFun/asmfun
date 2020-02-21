#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using AsmFun.EnvTools;
using AsmFun.Ide.Core.Features.Files;
using AsmFun.NetCore.Startup;

namespace AsmFun.Startup
{
    internal class SDLServiceRegisterer
    {
        public void Configure(IEmServiceResolverFactory container)
        {
            new AsmNetCoreRegisterer().Configure(container);
            container.Add<IFileSelectorPopup, FileSelectorPopup>();
        }
    }
}
