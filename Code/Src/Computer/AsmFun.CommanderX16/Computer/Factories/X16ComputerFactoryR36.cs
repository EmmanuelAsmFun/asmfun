using AsmFun.Common.ServiceLoc;

namespace AsmFun.CommanderX16.Computer.Factories
{
    public class X16ComputerFactoryR36 : X16ComputerFactoryR35
    {
        public const string ComputerVersionS = "R36";
        public X16ComputerFactoryR36(IEmServiceResolverFactory container)
            : base(container)
        {
            ComputerVersion = ComputerVersionS;
        }
    }
}
