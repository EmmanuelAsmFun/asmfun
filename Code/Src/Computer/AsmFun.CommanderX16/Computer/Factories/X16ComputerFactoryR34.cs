#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.CommanderX16.IO;
using AsmFun.CommanderX16.Video;
using AsmFun.CommanderX16.Video.Data;
using AsmFun.CommanderX16.Video.Painter;
using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Data.Computer;
using AsmFun.Computer.Common.Memory;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using AsmFun.Computer.Core.Video;
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
        protected override void AddAccessorContainer()
        {
            Add<IAccessorContainer, AccessorContainer>().WithLifestyle(EmServiceLifestyle.Singleton);
        }
        protected override void AddComputerAccess()
        {
            Add<IComputerAccess, X16ComputerAccessR33>().WithLifestyle(EmServiceLifestyle.Singleton);
        }
        protected override void AddPS2()
        {
            Add<IX16PS2Access, X16PS2AccessR34>().WithLifestyle(EmServiceLifestyle.Singleton);
        }

        protected override void AddVia()
        {
            Add<MemoryViaData, X16MemoryViaDataR34>().WithLifestyle(EmServiceLifestyle.Singleton);
        }

        protected override void AddSymbolsDA()
        {
            Add<ISymbolsDA, X16SymbolsDAR33>().WithLifestyle(EmServiceLifestyle.Singleton);
        }
        protected override void CreateVideoMemory()
        {
            base.OnCreateVideoMemoryTillR36();
        }
        protected override void AddDisplayComposer()
        {
            Add<IDisplayComposer, X16DisplayComposerR33>().WithLifestyle(EmServiceLifestyle.Singleton);
        }
        protected override void AddVideoLayerAccess()
        {
            Add<IVideoLayerAccess, X16VideoLayerAccessR33>().WithLifestyle(EmServiceLifestyle.Singleton);
        }
        protected override void AddTextPainter()
        {
            // TRANSIENT!!!
            Add<ITextPainter, TextPainterR33>().WithLifestyle(EmServiceLifestyle.Transient);
        }
        protected override void AddIOAccess()
        {
            Add<IX16IOAccess, X16IOAccessR33>().WithLifestyle(EmServiceLifestyle.Singleton);
        }
        protected virtual X16MemoryVideoData AddVideoRam(ComputerMemoryAccess computerMemory, ComputerSetupSettings computerSetup, IntPtr ram)
        {
            var memoryVideoData = new X16MemoryVideoData(ram, computerSetup.RamSize)
            {
                Type = MemoryAddressType.Video,
                Start = 0x9f20,
                End = 0x9f28,
                ReturnOffset = (isRead, address, bank) => address & 7
            };
            computerMemory.Add(memoryVideoData);
            return memoryVideoData;
        }
    }
}
