using AsmFun.CommanderX16.IO;
using AsmFun.CommanderX16.Video.Data;
using AsmFun.CommanderX16.Video.Painter;
using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Video;

namespace AsmFun.CommanderX16.Computer.Factories
{
    public class X16ComputerFactoryR35 : X16ComputerFactory
    {
        public const string ComputerVersionS = "R35";
        public X16ComputerFactoryR35(IEmServiceResolverFactory container)
            : base(container)
        {
            ComputerVersion = ComputerVersionS;
        }

        public override void AddPS2()
        {
            Add<IX16PS2Access, X16PS2AccessR34>().WithLifestyle(EmServiceLifestyle.Singleton);
        }
        public override void AddVideoPainter()
        {
            Add<IVideoPainter, X16VideoPainterR35>().WithLifestyle(EmServiceLifestyle.Singleton);
        }
        public override void AddVia()
        {
            Add<MemoryViaData, X16MemoryViaDataR34>().WithLifestyle(EmServiceLifestyle.Singleton);
        }

    }
}