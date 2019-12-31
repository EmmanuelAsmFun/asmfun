#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.CommanderX16.Computer;
using AsmFun.CommanderX16.IO;
using AsmFun.CommanderX16.Video;
using AsmFun.CommanderX16.Video.Access;
using AsmFun.CommanderX16.Video.Data;
using AsmFun.CommanderX16.Video.Painter;
using AsmFun.Common.Processors;
using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Data.Computer;
using AsmFun.Computer.Common.Debugger;
using AsmFun.Computer.Common.IO;
using AsmFun.Computer.Common.Processors;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using AsmFun.Computer.Core.Computer;
using AsmFun.Computer.Core.DataAccess.Computer;
using AsmFun.Computer.Core.Processors;
using AsmFun.Computer.Core.Processors.P6502;
using AsmFun.Computer.Core.Processors.P65c02;
using AsmFun.Computer.Core.Video;
using System;
using System.Runtime.InteropServices;

namespace AsmFun.CommanderX16.Computer.Factories
{
    public abstract class X16ComputerFactory : ComputerFactory
    {
        public const string ComputerTypenS = "CommanderX16";
        public X16ComputerFactory(IEmServiceResolverFactory resolverFactory) : base(resolverFactory)
        {
            ComputerType = new X16ComputerSetupSettings().ComputerType;
        }

        public override IComputer Create()
        {
            ConfigureIOC();
            Resolve<ComputerSetupSettings>().Version = base.ComputerVersion;
            ((X16VideoAccess)Resolve<IVideoAccess>()).Init(
                Resolve<X16IOAccess>(),
                Resolve<IVideoPainter>(),
                Resolve<IX16VideoMapTileAccess>()
                );
            ((X16DisplayComposer)Resolve<IDisplayComposer>()).Init(Resolve<IVideoPainter>());
            ((X16VideoRamAccess)Resolve<IVideoRamAccess>()).Init(Resolve<IX16VideoMapTileAccess>());
            ((X16ComputerAccess)Resolve<IComputerAccess>()).Init(
                Resolve<IComputer>(),
                Resolve<IComputerMemoryAccess>(),
                Resolve<MemoryViaData>()
                );

            Resolve<IVideoAccess>().Reset();
            ConfigureMemory();
            CreateVideoMemory();
            Resolve<IAccessorContainer>().Reset();
            ((X16Computer)Resolve<IComputer>()).ParseUsedServiceTypes(GetUsedServices());

            Resolve<P65c02Instructions>().Init(Resolve<IProcessor>());
            var computer = Resolve<IComputer>();
            computer.Reset();
            return computer;
        }

        private void ConfigureIOC()
        {
            // Data 
            Add<VideoSettings, X16VideoSettings>().WithLifestyle(EmServiceLifestyle.Singleton);
            AddPS2();
            Add<X16JoystickData>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IComputerMemoryAccess, X16ComputerMemoryAccess>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<ComputerSetupSettings, X16ComputerSetupSettings>().WithLifestyle(EmServiceLifestyle.Singleton);
            // Computer
            Add<X16VeraSpi>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IProcessor, X16Processor>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<ProcessorData>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<P65c02OpcodeModes>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<P65c02Instructions>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<P6502InstructionsDB>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IInstructionDB>(() => Resolve<P6502InstructionsDB>()).WithLifestyle(EmServiceLifestyle.Singleton);
            //
            Add<IComputer, X16Computer>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IComputerAccess, X16ComputerAccess>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<X16IOAccess, X16IOAccess>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IVideoAccess, X16VideoAccess>().WithLifestyle(EmServiceLifestyle.Singleton);
            AddVideoPainter();
            AddVia();
            Add<IAccessorContainer, AccessorContainer>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IKeyboardAccess, X16Keyboard>().WithLifestyle(EmServiceLifestyle.Singleton);
            // Video Accessors in memory
            Add<IVideoRamAccess, X16VideoRamAccess>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IVideoLayerAccess, X16VideoLayerAccess>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<ISpriteRegistersAccess, X16SpriteRegistersAccess>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<ISpriteAttributesAccess, X16SpriteAttributesAccess>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IDisplayComposer, X16DisplayComposer>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IVideoPaletteAccess, X16VideoPaletteAccess>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IX16VideoMapTileAccess, X16VideoMapTileAccess>().WithLifestyle(EmServiceLifestyle.Singleton);

            // Debugger;
            Add<IDebugger, X16DebuggerComputer>().WithLifestyle(EmServiceLifestyle.Singleton);
        }

        public virtual void AddPS2()
        {
            Add<IX16PS2Access, X16PS2AccessR33>().WithLifestyle(EmServiceLifestyle.Singleton);
        } 
        public virtual void AddVideoPainter()
        {
            Add<IVideoPainter, X16VideoPainterR33>().WithLifestyle(EmServiceLifestyle.Singleton);
        }

        public virtual void AddVia()
        {
            Add<MemoryViaData, X16MemoryViaDataR33>().WithLifestyle(EmServiceLifestyle.Singleton);
        }
        


        private void CreateVideoMemory()
        {
            var accessors = Resolve<IAccessorContainer>();
            var v = (X16VideoSettings)Resolve<VideoSettings>();
            accessors.AddInOrder(Resolve<IVideoRamAccess>(), v.VideoRamStartADD, v.VideoRamEndADD, a => a,null, v.VideoRamEndADDForUI);
            accessors.AddInOrder(Resolve<IDisplayComposer>(), v.ComposerStartADD, v.ComposerEndADD, a => a & 0xf, null, v.ComposerEndADDForUI);
            accessors.AddInOrder(Resolve<IVideoPaletteAccess>(), v.PaletteStartADD, v.PaletteEndADD, a => a & 0x1ff,null, v.PaletteEndADDForUI);
            accessors.AddInOrder(Resolve<IVideoLayerAccess>(), v.Layer1StartADD, v.Layer1EndADD, a => a & 0xf,"Layer1", v.Layer1EndADDForUI);
            accessors.AddInOrder(Resolve<IVideoLayerAccess>(), v.Layer2StartADD, v.Layer2EndADD, a => (a & 0xf) + 0x1000,"Layer2", v.Layer2EndADDForUI);// 0x1000 is a fix to know which layer
            accessors.AddInOrder(Resolve<ISpriteRegistersAccess>(), v.SpritesStartADD, v.SpritesEndADD, a => a & 0xf,null, v.SpritesEndADDForUI);
            accessors.AddInOrder(Resolve<ISpriteAttributesAccess>(), v.SpriteDataStartADD, v.SpriteDataEndADD, a => a,null, v.SpriteDataEndADDForUI);
            accessors.AddInOrder(Resolve<X16VeraSpi>(), v.SpiStartADD, v.SpiEndADD, a => a & 1, null,v.SpiEndADDForUI);
        }


        private void ConfigureMemory()
        {
            var computerMemory = (ComputerMemoryAccess)Resolve<IComputerMemoryAccess>();
            var computerSetup = Resolve<ComputerSetupSettings>();
            computerSetup.RomSize = computerSetup.NmbrRomBanks * computerSetup.RomBankSize;
            computerSetup.RamSize = 0xa000 + computerSetup.NmbrRamBanks * computerSetup.RamBankSize;
            // Create memory allocations
            IntPtr ram = Marshal.AllocHGlobal(computerSetup.RamSize);
            IntPtr rom = Marshal.AllocHGlobal(computerSetup.RomSize);
            computerMemory.Add(new MemoryDataAccess(ram, computerSetup.RamSize)
            {
                Type = MemoryAddressType.RAM,
                Start = 0,
                End = 0x9f00,
                ReturnOffset = (isRead, address, bank) => address,
            });
            computerMemory.Add(new MemoryDataAccess(rom, computerSetup.RomSize)
            {
                Type = MemoryAddressType.Sound,
                Start = 0x9f00,
                End = 0x9f20,
                ReturnOffset = (isRead, address, bank) => address
            });
            var memoryVideoData = new X16MemoryVideoData(ram, computerSetup.RamSize)
            {
                Type = MemoryAddressType.Video,
                Start = 0x9f20,
                End = 0x9f28,
                ReturnOffset = (isRead, address, bank) => address & 7
            };
            computerMemory.Add(memoryVideoData);
            computerMemory.Add(new MemoryDataAccess(rom, computerSetup.RomSize)
            {
                Type = MemoryAddressType.CharacterLCD,
                Start = 0x9f40,
                End = 0x9f60,
                ReturnOffset = (isRead, address, bank) => address
            });
            var via1 = new MemoryDataAccessDeffered(Marshal.AllocHGlobal(16), 16)
            {
                Type = MemoryAddressType.Via1,
                Start = 0x9f60,
                End = 0x9f70,
                ReturnOffset = (isRead, address, bank) => address & 0xf,
            };
            computerMemory.Add(via1);
            var via2 = new MemoryDataAccessDeffered(Marshal.AllocHGlobal(16), 16)
            {
                Type = MemoryAddressType.Via2,
                Start = 0x9f70,
                End = 0x9f80,
                ReturnOffset = (isRead, address, bank) => address & 0xf,
            };
            computerMemory.Add(via2);
            computerMemory.Add(new MemoryDataAccess(rom, computerSetup.RomSize)
            {
                Type = MemoryAddressType.RTC,
                Start = 0x9f80,
                End = 0x9fa0,
                ReturnOffset = (isRead, address, bank) => address,
            });
            computerMemory.Add(new MemoryDataAccess(rom, computerSetup.RomSize)
            {
                Type = MemoryAddressType.Mouse,
                Start = 0x9fa0,
                End = 0x9fb0,
                ReturnOffset = (isRead, address, bank) => address & 0x1f,
            });
            computerMemory.Add(new X16MemoryComputer(rom, computerSetup.RomSize)
            {
                Type = MemoryAddressType.Computer,
                Start = 0x9fb0,
                End = 0x9fc0,
                ReturnOffset = (isRead, address, bank) => address & 0xf,
            });

            AddBankedRam(computerMemory, computerSetup, ram);
            AddBankedRom(computerMemory, computerSetup, rom);
           
            // Must be latest
            computerMemory.Add(new MemoryDataAccess(rom, computerSetup.RomSize)
            {
                Type = MemoryAddressType.ROM,
                Start = computerSetup.RomSize, // We may never access it directly, only through bankedROM!
                End = computerSetup.RomSize + computerSetup.RamSize,
                ReturnOffset = (isRead, address, bank) => (bank << 14) + address - 0xc000,
            });
            // Dummy address
            computerMemory.Add(new MemoryDataAccess(ram, computerSetup.RamSize)
            {
                Type = MemoryAddressType.Unknown,
                Start = 0x9fc0,
                End = 0xffff,
                ReturnOffset = (isRead, address, bank) => address,
            });

            ((IMemoryViaData)Resolve<MemoryViaData>()).Init(via1, via2);
            Resolve<X16IOAccess>().Init(Resolve<IVideoAccess>());
            memoryVideoData.Init(Resolve<X16IOAccess>());
        }

        protected virtual void AddBankedRam(ComputerMemoryAccess computerMemory, ComputerSetupSettings computerSetup, IntPtr ram)
        {
            computerMemory.Add(new MemoryDataAccess(ram, computerSetup.RamSize)
            {
                Type = MemoryAddressType.BankedRAM,
                Start = 0xa000,
                End = 0xc000,
                ReturnOffset = (isRead, address, bank) => 0xa000 + (computerMemory.RamBank % computerSetup.NmbrRamBanks << 13) + address - 0xa000
            });
        }
        protected virtual void AddBankedRom(ComputerMemoryAccess computerMemory, ComputerSetupSettings computerSetup, IntPtr rom)
        {
            computerMemory.Add(new MemoryDataAccess(rom, computerSetup.RomSize)
            {
                Type = MemoryAddressType.BankedROM,
                Start = 0xc000,
                End = computerSetup.RomSize,
                ReturnOffset = (isRead, address, bank) => (computerMemory.RomBank << 14) + address - 0xc000,
            });
        }

    }
}
