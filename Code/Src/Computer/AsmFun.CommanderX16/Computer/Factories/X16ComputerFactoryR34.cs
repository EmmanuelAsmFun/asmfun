#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.CommanderX16.IO;
using AsmFun.CommanderX16.Video.Data;
using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Data.Computer;
using AsmFun.Computer.Core.DataAccess.Computer;
using System;

namespace AsmFun.CommanderX16.Computer.Factories
{
    public class X16ComputerFactoryR34 : X16ComputerFactory
    {
        public const string ComputerVersionS = "R34";

        public X16ComputerFactoryR34(IEmServiceResolverFactory container) : base(container)
        {
            ComputerVersion = ComputerVersionS;
        }


        public override void AddPS2()
        {
            Add<IX16PS2Access, X16PS2AccessR34>().WithLifestyle(EmServiceLifestyle.Singleton);
        }
       
        public override void AddVia()
        {
            Add<MemoryViaData, X16MemoryViaDataR34>().WithLifestyle(EmServiceLifestyle.Singleton);
        }

    }
}
