#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.CommanderX16.Audio;
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
using AsmFun.Computer.Common.Memory;
using AsmFun.Computer.Common.Processors;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using AsmFun.Computer.Core.Computer;
using AsmFun.Computer.Core.DataAccess.Computer;
using AsmFun.Computer.Core.Debugger;
using AsmFun.Computer.Core.Processors;
using AsmFun.Computer.Core.Processors.P6502;
using AsmFun.Computer.Core.Processors.P65c02;
using AsmFun.Computer.Core.Sound.Yamaha2151;
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

        public override IComputer Create(ComputerSettings computerSettings)
        {
            
            ConfigureIOC();
            Resolve<VideoSettings>().ComputerVersionNum = ComputerVersionNum;
            // Get computer setup
            Resolve<ComputerSetupSettings>().Version = base.ComputerVersion;
            ((X16VideoAccess)Resolve<IVideoAccess>()).Init(
                Resolve<IX16IOAccess>(),
                Resolve<IVideoPainter>(),
                Resolve<IX16VideoMapTileAccess>()
                );
            Resolve<ISpriteAttributesAccess>().Init(Resolve<IDisplayComposer>());

            ((X16Processor)Resolve<IProcessor>()).Init(Resolve<IDebugger>());
            var accContainer = Resolve<IAccessorContainer>();
            if (accContainer is X16AccessorContainer x16AccessorContainer)
                x16AccessorContainer.Init(Resolve<IDisplayComposer>(),Resolve<IVideoLayerAccess>(), Resolve<X16VeraSpi>());
            Resolve<IDisplayComposer>().Init(Resolve<IVideoPainter>());
            ((X16VideoRamAccess)Resolve<IVideoRamAccess>()).Init(Resolve<IX16VideoMapTileAccess>());
            ((X16ComputerAccessR33)Resolve<IComputerAccess>()).Init(
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
            Resolve<IKeyboardAccess>().SelectKeyMap(computerSettings.KeyMapIndex);
            return computer;
        }

        private void ConfigureIOC()
        {
            // Data 
            AddSymbolsDA();
            Add<VideoSettings, X16VideoSettings>().WithLifestyle(EmServiceLifestyle.Singleton);
            AddPS2();
            Add<X16JoystickData>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IComputerMemoryAccess, X16ComputerMemoryAccess>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<ComputerSetupSettings, X16ComputerSetupSettings>().WithLifestyle(EmServiceLifestyle.Singleton);
            // Computer
            Add<X16VeraSpi>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IUart,X16Uart>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IProcessor, X16Processor>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<ProcessorData>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<P65c02OpcodeModes>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<P65c02Instructions>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<P6502InstructionsDB>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IProgramAccess,X16ProgramAccess>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IInstructionDB>(() => Resolve<P6502InstructionsDB>()).WithLifestyle(EmServiceLifestyle.Singleton);
            //
            Add<IComputer, X16Computer>().WithLifestyle(EmServiceLifestyle.Singleton);
            AddComputerAccess();
            AddIOAccess();
            Add<IVideoAccess, X16VideoAccess>().WithLifestyle(EmServiceLifestyle.Singleton);
            AddVideoPainter();
            AddTextPainter();
            AddVia();
            AddAccessorContainer();
            Add<IKeyboardAccess, X16Keyboard>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IKeyboardMapping, KeyboardMapping>().WithLifestyle(EmServiceLifestyle.Singleton);
            // Video Accessors in memory
            Add<IVideoRamAccess, X16VideoRamAccess>().WithLifestyle(EmServiceLifestyle.Singleton);
            AddVideoLayerAccess();
            Add<ISpriteRegistersAccess, X16SpriteRegistersAccess>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<ISpriteAttributesAccess, X16SpriteAttributesAccess>().WithLifestyle(EmServiceLifestyle.Singleton);
            AddDisplayComposer();
            Add<IVideoPaletteAccess, X16VideoPaletteAccess>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IX16VideoMapTileAccess, X16VideoMapTileAccess>().WithLifestyle(EmServiceLifestyle.Singleton);
            // Audio
            Add<IVeraPsg, X16VeraPsg>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IVeraPCM, X16VeraPCM>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<Ym2151, Ym2151>().WithLifestyle(EmServiceLifestyle.Singleton);
            // Debugger;
            Add<IDebugger, X16DebuggerComputer>().WithLifestyle(EmServiceLifestyle.Singleton);
            Add<IDataLogger, DataLogger>().WithLifestyle(EmServiceLifestyle.Singleton);
        }
        protected virtual void AddAccessorContainer()
        {
            Add<IAccessorContainer, X16AccessorContainer>().WithLifestyle(EmServiceLifestyle.Singleton);
        }  
        protected virtual void AddComputerAccess()
        {
            Add<IComputerAccess, X16ComputerAccessR37>().WithLifestyle(EmServiceLifestyle.Singleton);
        } 
        protected virtual void AddDisplayComposer()
        {
            Add<IDisplayComposer, X16DisplayComposerR37>().WithLifestyle(EmServiceLifestyle.Singleton);
        } 
        protected virtual void AddVideoLayerAccess()
        {
            Add<IVideoLayerAccess, X16VideoLayerAccessR37>().WithLifestyle(EmServiceLifestyle.Singleton);
        }

        protected virtual void AddPS2()
        {
            Add<IX16PS2Access, X16PS2AccessR33>().WithLifestyle(EmServiceLifestyle.Singleton);
        } 
        protected virtual void AddIOAccess()
        {
            Add<IX16IOAccess, X16IOAccessR37>().WithLifestyle(EmServiceLifestyle.Singleton);
        }
        protected virtual void AddSymbolsDA()
        {
            Add<ISymbolsDA, X16SymbolsDA>().WithLifestyle(EmServiceLifestyle.Singleton);
        }
        protected virtual void AddVideoPainter()
        {
            Add<IVideoPainter, X16VideoPainterR33>().WithLifestyle(EmServiceLifestyle.Singleton);
        }
        protected virtual void AddTextPainter()
        {
            // TRANSIENT!!!
            Add<ITextPainter, TextPainter>().WithLifestyle(EmServiceLifestyle.Transient);
        }

        protected virtual void AddVia()
        {
            Add<MemoryViaData, X16MemoryViaDataR33>().WithLifestyle(EmServiceLifestyle.Singleton);
        }
        
        protected virtual void CreateVideoMemory()
        {
            var accessors = Resolve<IAccessorContainer>();
            var v = (X16VideoSettings)Resolve<VideoSettings>();
            v.ComposerStartADD = 0x9F29;
            v.ComposerEndADD = 0x9F2C;
            v.ComposerEndADDForUI = 0x9F2C;
            v.Layer1StartADD = 0x9F2D;
            v.Layer1EndADD = 0x9F33;
            v.Layer1EndADDForUI = 0x9F33;
            v.Layer2StartADD = 0x9F34;
            v.Layer2EndADD = 0x9F3A;
            v.Layer2EndADDForUI = 0x9F3A;
            v.SpiStartADD = 0x9F3E;
            v.SpiEndADD = 0x9F3F;
            v.SpiEndADDForUI = 0x9F3F;
            v.PaletteStartADD = 0x1FA00;
            v.PaletteEndADD = 0x1FC00;
            v.PaletteEndADDForUI = 0x1F1FF;
            v.SpriteDataStartADD = 0x1FC00;
            v.SpriteDataEndADD = 0x20000;
            v.SpriteDataEndADDForUI = 0x1FC0F;
            var spritesAttr = ((X16SpriteAttributesAccess)Resolve<ISpriteAttributesAccess>());
            spritesAttr.UpdateAddresses();
            //accessors.AddInOrder(Resolve<IDisplayComposer>(), v.ComposerStartADD, v.ComposerEndADD, a => a & 0xf, null, v.ComposerEndADDForUI);
            accessors.AddInOrder(Resolve<IVeraPsg>(), v.PSGStartADD, v.PSGEndADD, a => a & 0x3f, null, v.PSGEndADDForUI);
            accessors.AddInOrder(Resolve<IVideoPaletteAccess>(), v.PaletteStartADD, v.PaletteEndADD, a => a & 0x1ff, null, v.PaletteEndADDForUI);
            //accessors.AddInOrder(Resolve<IVideoLayerAccess>(), v.Layer1StartADD, v.Layer1EndADD, a => a & 0xf, "Layer1", v.Layer1EndADDForUI);
            //accessors.AddInOrder(Resolve<IVideoLayerAccess>(), v.Layer2StartADD, v.Layer2EndADD, a => (a & 0xf) + 0x1000, "Layer2", v.Layer2EndADDForUI);// 0x1000 is a fix to know which layer
            //accessors.AddInOrder(Resolve<ISpriteRegistersAccess>(), v.SpritesStartADD, v.SpritesEndADD, a => a & 0xf, null, v.SpritesEndADDForUI);
            accessors.AddInOrder(Resolve<ISpriteAttributesAccess>(), v.SpriteDataStartADD, v.SpriteDataEndADD, a => a, null, v.SpriteDataEndADDForUI);
            //accessors.AddInOrder(Resolve<X16VeraSpi>(), v.SpiStartADD, v.SpiEndADD, a => a & 1, null, v.SpiEndADDForUI);
            // Add for resting addresses the ram
            accessors.AddInOrder(Resolve<IVideoRamAccess>(), v.VideoRamStartADD, v.VideoRamEndADD, a => a, null, v.VideoRamEndADDForUI);
        }

        protected void OnCreateVideoMemoryTillR36()
        {
            var accessors = Resolve<IAccessorContainer>();
            var spritesAttr = ((X16SpriteAttributesAccess)Resolve<ISpriteAttributesAccess>());
            spritesAttr.UpdateAddresses();
            spritesAttr.SpriteAddressSize = 0xff;
            var v = (X16VideoSettings)Resolve<VideoSettings>();
            accessors.AddInOrder(Resolve<IVideoRamAccess>(), v.VideoRamStartADD, v.VideoRamEndADD, a => a,null, v.VideoRamEndADDForUI);
            accessors.AddInOrder(Resolve<IDisplayComposer>(), v.ComposerStartADD, v.ComposerEndADD, a => a & 0xf, null, v.ComposerEndADDForUI);
            accessors.AddInOrder(Resolve<IVideoPaletteAccess>(), v.PaletteStartADD, v.PaletteEndADD, a => a & 0x1ff,null, v.PaletteEndADDForUI);
            accessors.AddInOrder(Resolve<IVideoLayerAccess>(), v.Layer1StartADD, v.Layer1EndADD, a => a & 0xf,"Layer1", v.Layer1EndADDForUI);
            accessors.AddInOrder(Resolve<IVideoLayerAccess>(), v.Layer2StartADD, v.Layer2EndADD, a => (a & 0xf) + 0x1000,"Layer2", v.Layer2EndADDForUI);// 0x1000 is a fix to know which layer
            accessors.AddInOrder(Resolve<ISpriteRegistersAccess>(), v.SpritesStartADD, v.SpritesEndADD, a => a & 0xf,null, v.SpritesEndADDForUI);
            accessors.AddInOrder(Resolve<ISpriteAttributesAccess>(), v.SpriteDataStartADD, v.SpriteDataEndADD, a => a,null, v.SpriteDataEndADDForUI);
            accessors.AddInOrder(Resolve<X16VeraSpi>(), v.SpiStartADD, v.SpiEndADD, a => a & 1, null,v.SpiEndADDForUI);
            accessors.AddInOrder(Resolve<IUart>(), v.UartStartADD, v.UartEndADD, a => a & 3, null,v.UartStartADDForUI);
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
            var memoryVideoData = AddVideoRam(computerMemory,computerSetup,ram);
            
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
                End = 0x9fe0,
                ReturnOffset = (isRead, address, bank) => address,
            });
            // Audio
            computerMemory.Add(new X16AudioMemory(Resolve<Ym2151>())
            {
                Type = MemoryAddressType.YM2151,
                Start = 0x9fe0,
                End = 0x9fe1,
                ReturnOffset = (isRead, address, bank) => address,
            });
            // Dummy address
            computerMemory.Add(new MemoryDataAccess(ram, computerSetup.RamSize)
            {
                Type = MemoryAddressType.Unknown2,
                Start = 0x9fe1,
                End = 0xffff,
                ReturnOffset = (isRead, address, bank) => address,
            });

            ((IMemoryViaData)Resolve<MemoryViaData>()).Init(via1, via2);
            Resolve<IX16IOAccess>().Init(Resolve<IVideoAccess>());
            memoryVideoData.Init(Resolve<IX16IOAccess>());
        }
        protected virtual X16MemoryVideoData AddVideoRam(ComputerMemoryAccess computerMemory, ComputerSetupSettings computerSetup, IntPtr ram)
        {
            var memoryVideoData = new X16MemoryVideoData(ram, computerSetup.RamSize)
            {
                Type = MemoryAddressType.Video,
                Start = 0x9f20,
                End = 0x9f40,
                ReturnOffset = (isRead, address, bank) => address & 0x1f
            };
            computerMemory.Add(memoryVideoData);
            return memoryVideoData;
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
