#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.DataAccess;
using AsmFun.Common.ServiceLoc;
using AsmFun.Core;

namespace AsmFun.NetCore.Startup
{
    public class AsmNetCoreRegisterer
    {
        public void Configure(IEmServiceResolverFactory container)
        {
            container.Add<IAsmJSonSerializer, AsmFunJSonSerializer>();
        }
    }
}
