#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;

namespace AsmFun.Core.Startup
{
    public class CoreStartup
    {
        IEmServiceResolverFactory container;
        public void Configure(IEmServiceResolverFactory container)
        {
            this.container = container;

           
        }
    }
}
