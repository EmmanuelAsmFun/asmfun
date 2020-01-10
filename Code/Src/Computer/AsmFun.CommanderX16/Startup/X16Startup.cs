#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.CommanderX16.Computer.Factories;
using AsmFun.Common.ServiceLoc;

namespace AsmFun.CommanderX16.Startup
{
    public class X16Startup
    {
        private IEmServiceResolverFactory container;

        public void Configure(IEmServiceResolverFactory container)
        {
            this.container = container;
            container.Add<X16ComputerFactoryR33>().WithLifestyle(EmServiceLifestyle.Transient);
            container.Add<X16ComputerFactoryR34>().WithLifestyle(EmServiceLifestyle.Transient);
            container.Add<X16ComputerFactoryR35>().WithLifestyle(EmServiceLifestyle.Transient);
            container.Add<X16ComputerFactoryR36>().WithLifestyle(EmServiceLifestyle.Transient);
            
        }
    }
}
