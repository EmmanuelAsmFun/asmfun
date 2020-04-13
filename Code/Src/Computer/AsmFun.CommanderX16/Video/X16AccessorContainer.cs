using AsmFun.CommanderX16.Video.Access;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Memory;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using AsmFun.Computer.Core.Video;
using System;
using System.Linq;

namespace AsmFun.CommanderX16.Video
{
    public class X16AccessorContainer : AccessorContainer
    {
        private IDisplayComposer composer;
        private IVideoLayerAccess videoLayerAccess;
        private X16VeraSpi veraSpi;
        private IVideoRamAccess RAM;
        private readonly X16VideoSettings videoSettings;

        public X16AccessorContainer(VideoSettings videoSettings)
        {
            this.videoSettings = (X16VideoSettings)videoSettings;
        }

        public void Init(IDisplayComposer composer, IVideoLayerAccess videoLayerAccess, X16VeraSpi veraSpi)
        {
            this.videoLayerAccess = videoLayerAccess;
            this.veraSpi = veraSpi;
            this.composer = composer;
        }

        public override void AddInOrder(IMemoryAccessable accessor, uint startAddress, uint endAddress, Func<uint, uint> addressTransform
            , string name = null, uint addEddressForUI = 0)
        {
            Add(accessor, startAddress, endAddress, addressTransform, name, addEddressForUI);
            if (accessor is IVideoRamAccess ram)
                RAM = ram;
        }

        public override byte Read(uint address)
        {
            return RAM.Read(address);
        }

        public override byte[] ReadBlock(uint address, int length)
        {
            return RAM.ReadBlock(address, length);
        }



        public override void Write(uint address, byte value)
        {
            //diagnose.WriteRAM(address, value);
            RAM.Write(address & 0x1FFFF, value);
            foreach (AccessorItem accessor in accessors)
            {
                if (address >= accessor.StartAddress && address < accessor.EndAddress)
                {
                    if (accessor.Accessor == RAM) return;
                    accessor.Accessor.Write(accessor.AddressTransform(address), value);
                    return;
                }

            }
        }

        public override void WriteBlock(int address, byte[] data, int count)
        {
            var addr = (uint)address;
           var composerAdd = videoSettings.ComposerStartADD;
            if (addr == videoSettings.ComposerStartADD)
            {
                composer.WriteBlock(data, 0, 0, count); 
                return;
            }
            if (addr == videoSettings.Layer1StartADD)
            {
                videoLayerAccess.WriteBlock(data, 0, address & 0xf, count); 
                return;
            }
            if (addr == videoSettings.Layer2StartADD)
            {
                videoLayerAccess.WriteBlock(data, 0, address & 0xf + 0x1000, count); 
                return;
            }
            
            RAM.WriteBlock(data, 0, address & 0x1FFFF, count);
            foreach (AccessorItem accessor in accessors)
            {
                if (address >= accessor.StartAddress && address < accessor.EndAddress)
                {
                    if (accessor.Accessor == RAM) return;
                    accessor.Accessor.WriteBlock(data, 0, (int)accessor.AddressTransform((uint)address), count);
                    return;
                }

            }
        }
        
        public override MemoryDumpData[] MemoryDump()
        {
            var returnData = base.MemoryDump().ToList();
            // Add display composer
            var dump = new MemoryDumpData
            {
                StartAddress = (int)videoSettings.ComposerStartADD, // two timesfor each dcsel
                EndAddress = (int)videoSettings.ComposerEndADD,
                EndAddressForUI = (int)videoSettings.ComposerEndADDForUI,
                Name = composer.Name,
                MemoryType = MemoryAddressType.Video,
            };
            dump.Data = composer.MemoryDump(0);
            returnData.Insert(0,dump);

            // Add layer1
            dump = new MemoryDumpData
            {
                StartAddress = (int)videoSettings.Layer1StartADD,
                EndAddress = (int)videoSettings.Layer1EndADD,
                EndAddressForUI = (int)videoSettings.Layer1EndADDForUI,
                Name = "Layer1",
                MemoryType = MemoryAddressType.Video,
            };
            dump.Data = videoLayerAccess.MemoryLayerDump(0);
            returnData.Insert(3, dump);

            // Add layer2
            dump = new MemoryDumpData
            {
                StartAddress = (int)videoSettings.Layer2StartADD,
                EndAddress = (int)videoSettings.Layer2EndADD,
                EndAddressForUI = (int)videoSettings.Layer2EndADDForUI,
                Name = "Layer2",
                MemoryType = MemoryAddressType.Video,
            };
            dump.Data = videoLayerAccess.MemoryLayerDump(1);
            returnData.Insert(4, dump);
            
            // Add SPI
            dump = new MemoryDumpData
            {
                StartAddress = (int)videoSettings.SpiStartADD,
                EndAddress = (int)videoSettings.SpiEndADD,
                EndAddressForUI = (int)videoSettings.SpiEndADDForUI,
                Name = veraSpi.Name,
                MemoryType = MemoryAddressType.Video,
            };
            dump.Data = veraSpi.MemoryDump(0);
            returnData.Insert(6, dump);




            return returnData.ToArray();
        }
    }

}
