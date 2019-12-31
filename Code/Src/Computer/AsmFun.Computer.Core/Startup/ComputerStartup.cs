#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.DataAccess;
using AsmFun.Computer.Common.Managers;
using AsmFun.Computer.Core.DataAccess;
using AsmFun.Computer.Core.Managers;
using System;

namespace AsmFun.Computer.Startup
{
    public class ComputerStartup : IDisposable
    {
        IEmServiceResolverFactory container;
        public void Configure(IEmServiceResolverFactory container)
        {
            this.container = container;
            container.Add(this).WithLifestyle(EmServiceLifestyle.Singleton);
            container.Add<IComputerManager, ComputerManager>().WithLifestyle(EmServiceLifestyle.Singleton);
            // Transient
            container.Add<IAsmMemoryReader, AsmMemoryReader>().WithLifestyle(EmServiceLifestyle.Transient);
        }


        public void Dispose()
        {

        }
    }
}
