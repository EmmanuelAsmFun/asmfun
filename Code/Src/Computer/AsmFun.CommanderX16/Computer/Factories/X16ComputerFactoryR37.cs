using AsmFun.CommanderX16.IO;
using AsmFun.CommanderX16.Video.Data;
using AsmFun.CommanderX16.Video.Painter;
using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Data.Computer;
using AsmFun.Computer.Common.Video;
using System;

namespace AsmFun.CommanderX16.Computer.Factories
{
    public class X16ComputerFactoryR37 : X16ComputerFactory
    {
        public const string ComputerVersionS = "R37";
        public X16ComputerFactoryR37(IEmServiceResolverFactory container)
            : base(container)
        {
            ComputerVersion = ComputerVersionS;
        }

        protected override void AddPS2()
        {
            Add<IX16PS2Access, X16PS2AccessR34>().WithLifestyle(EmServiceLifestyle.Singleton);
        }
        protected override void AddVideoPainter()
        {
            Add<IVideoPainter, X16VideoPainterR35>().WithLifestyle(EmServiceLifestyle.Singleton);
        }
        protected override void AddVia()
        {
            Add<MemoryViaData, X16MemoryViaDataR34>().WithLifestyle(EmServiceLifestyle.Singleton);
        }

        
    }
}
