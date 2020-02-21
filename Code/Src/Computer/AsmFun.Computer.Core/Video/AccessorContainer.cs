#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Memory;
using AsmFun.Computer.Common.Video;
using AsmFun.Computer.Common.Video.Data;
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace AsmFun.Computer.Core.Video
{
    public class AccessorContainer : IAccessorContainer
    {
        private uint lastMaxAddress = 0;
        private List<AccessorItem> accessors = new List<AccessorItem>();

        public AccessorContainer()
        {

        }
        public void AddInOrder(IMemoryAccessable accessor, uint startAddress, uint endAddress, Func<uint, uint> addressTransform
            ,string name= null, uint addEddressForUI = 0)
        {
            // Fill in the gap if needed
            if (lastMaxAddress != startAddress)
                accessors.Add(new AccessorItem
                {
                    Accessor = new DummmyMemorySpace(),
                    StartAddress = lastMaxAddress,
                    EndAddress = startAddress,
                    EndAddressForUI = startAddress,
                    AddressTransform = x => x
                });
            accessors.Add(new AccessorItem
            {
                Accessor = accessor,
                StartAddress = startAddress,
                EndAddress = endAddress,
                EndAddressForUI = addEddressForUI,
                AddressTransform = addressTransform,
                Name = name?? accessor.Name
            });
            lastMaxAddress = endAddress;
        }
        public void Clear()
        {
            accessors.Clear();
        }
        public void Init()
        {
            accessors.ForEach(x => x.Accessor.Init());
        }

        public void Reset()
        {
            accessors.ForEach(x => x.Accessor.Reset());
        }

        public byte Read(uint address)
        {
            foreach (AccessorItem accessor in accessors)
            {
                if (address >= accessor.StartAddress && address < accessor.EndAddress)
                    return accessor.Accessor.Read(accessor.AddressTransform(address));
            }
            return 0xFF;
        }

        public byte[] ReadBlock(uint address, int length)
        {
            foreach (AccessorItem accessor in accessors)
            {
                if (address >= accessor.StartAddress && address < accessor.EndAddress)
                    return accessor.Accessor.ReadBlock(accessor.AddressTransform(address), length);

            }
            return new byte[0];
        }



        public void Write(uint address, byte value)
        {
            foreach (AccessorItem accessor in accessors)
            {
                if (address >= accessor.StartAddress && address < accessor.EndAddress)
                {
                    accessor.Accessor.Write(accessor.AddressTransform(address), value);
                    return;
                }

            }
        }

        public void WriteBlock(int address, byte[] data, int count)
        {
            foreach (AccessorItem accessor in accessors)
            {
                if (address >= accessor.StartAddress && address < accessor.EndAddress)
                {
                    accessor.Accessor.WriteBlock(data,0,(int)accessor.AddressTransform((uint)address), count);
                    return;
                }

            }
        }

        public MemoryDumpData[] MemoryDump()
        {
            var returnData = new List<MemoryDumpData>();
            foreach (AccessorItem accessor in accessors)
            {
                if (accessor.Accessor is DummmyMemorySpace) continue;
                var dump = new MemoryDumpData {
                    StartAddress = (int)accessor.StartAddress,
                    EndAddress = (int)accessor.EndAddress,
                    EndAddressForUI = (int)accessor.EndAddressForUI,
                    Name = accessor.Name ?? accessor.Accessor.Name,
                    MemoryType = Common.Computer.Data.MemoryAddressType.Video,
                };
                dump.Data = accessor.Accessor.MemoryDump((int)accessor.StartAddress);
                returnData.Add(dump);
            }
            return returnData.ToArray();
        }

       

        [DebuggerDisplay("{StartAddress.ToString(\"X2\")}-{EndAddress.ToString(\"X2\")}:{Accessor.GetType().Name}")]
        private class AccessorItem
        {
            public uint StartAddress;
            public uint EndAddress;
            public IMemoryAccessable Accessor;
            public Func<uint, uint> AddressTransform;

            public string Name { get; internal set; }
            public uint EndAddressForUI;
        }
        private class DummmyMemorySpace : IMemoryAccessable
        {
            public string Name => "Unused";

            public void Init() { }

            public void MemoryDump(byte[] data, int startAddress)
            {
            }

            public byte[] MemoryDump(int startAddress)
            {
                return new byte[0];
            }

            public byte Read(uint address) { return 0; }
            public byte[] ReadBlock(uint address, int length) { return new byte[] { }; }
            public void Reset() { }
            public void Write(uint address, byte value) { }
            public void WriteBlock(byte[] bytes, int sourceIndex, int targetIndex, int length) { }

        }
    }
}
