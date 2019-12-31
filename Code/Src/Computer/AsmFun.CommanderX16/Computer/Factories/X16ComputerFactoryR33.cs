#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;

namespace AsmFun.CommanderX16.Computer.Factories
{
    public class X16ComputerFactoryR33 : X16ComputerFactory
    {
        public const string ComputerVersionS = "R33";
        public X16ComputerFactoryR33(IEmServiceResolverFactory container)
            : base(container)
        {
            ComputerVersion = ComputerVersionS;
        }


      
        
    }
}
