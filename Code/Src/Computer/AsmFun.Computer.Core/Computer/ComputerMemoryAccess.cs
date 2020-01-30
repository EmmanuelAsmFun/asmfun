#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Processors;
using AsmFun.Computer.Core.Computer;
using AsmFun.Computer.Core.DataAccess.Computer;
using System;
using System.Collections.Generic;

namespace AsmFun.Computer.Common.Data.Computer
{
    public class ComputerMemoryAccess : IDisposable, IComputerMemoryAccess
    {

        protected readonly Dictionary<MemoryAddressType, MemoryDataAccess> ByType = new Dictionary<MemoryAddressType, MemoryDataAccess>();
        protected readonly List<MemoryDataAccess> Memories = new List<MemoryDataAccess>();
        protected IComputerAccess computerAccess;

        public int RamBank { get; set; }
        public int RomBank { get; set; }

        public ComputerMemoryAccess(IComputerAccess computerAccess)
        {
            this.computerAccess = computerAccess;
        }

        public virtual void Reset()
        {
            foreach (var memory in Memories)
                memory.Reset();
        }

        public virtual void Add(MemoryDataAccess data)
        {
            lock (ByType)
            {
                ByType.Add(data.Type, data);
                Memories.Add(data);
            }
        }
        public virtual byte ReadByte(MemoryAddressType type, ushort address, int bank = 0)
        {
            return ByType[type].ReadByte(address, bank);
        }
        public virtual byte ReadByte(ushort address, int bank = 0)
        {
            var type = computerAccess.GetAddressType(address, bank);
            if (ByType.ContainsKey(type))
            //lock (ByType)
                return ByType[type].ReadByte(address, bank);
            return 0;
        }
        public virtual void WriteByte(ushort address, byte value)
        {
            var type = computerAccess.GetAddressType(address, 0);
            //lock (ByType)
                ByType[type].WriteByte(address, 0, value);
        }
        public virtual void WriteByte(ushort address, int bank, byte value)
        {
            var type = computerAccess.GetAddressType(address, bank);
            //lock (ByType)
                ByType[type].WriteByte(address, bank, value);
        }
        public virtual MemoryDataAccess GetMemoryData(int address, int bank)
        {
            var type = computerAccess.GetAddressType(address, bank);
            //lock (ByType)
                return ByType[type];
        }

        public virtual void Dispose()
        {
            //lock (ByType)
            {
                Memories.ForEach(x => x.Dispose());
            }
        }

        public virtual void WriteROM(byte[] bytes, int startIndex = 0)
        {
            var rom = ByType[MemoryAddressType.ROM];
            rom.WriteBlock(bytes, startIndex);
        }

        public virtual void WriteRAM(byte[] bytes, int startIndex = 0)
        {
            var ram = ByType[MemoryAddressType.RAM];
            ram.WriteBlock(bytes, startIndex);
        }
        public virtual void WriteRAM(byte[] bytes, int sourceOffest, int targetOffset, int length)
        {
            var ram = ByType[MemoryAddressType.RAM];
            ram.WriteBlock(bytes, sourceOffest, targetOffset, length);

        }

        public virtual int GetRealMemoryAddress(MemoryAddressType type)
        {
            var memm = ByType[type];
            return memm.GetRealMemoryAddress();
        } 
        public virtual int GetStartAddress(MemoryAddressType type)
        {
            var memm = ByType[type];
            return memm.Start;
        } 
        public virtual int GetEndAddress(MemoryAddressType type)
        {
            var memm = ByType[type];
            return memm.End;
        }
        public virtual void TraceData(MemoryAddressType type, int offset, int length)
        {
            var memm = ByType[type];
            memm.TraceData(offset, length);
        }

        public virtual byte[] ReadBlock(int address, int length)
        {
            var type = computerAccess.GetAddressType(address, 0);
           // lock (ByType)
                return ByType[type].ReadBlock(address, length);
        } 
        public virtual byte[] ReadBlock(MemoryAddressType type,int address, int length)
        {
           // lock (ByType)
                return ByType[type].ReadBlock(address, length);
        }
        public virtual ushort ReadUShort(int address)
        {
            var type = computerAccess.GetAddressType(address, 0);
            //lock (ByType)
                return ByType[type].ReadUShort(address);
        }

        public virtual void WriteUShort(int address, ushort value)
        {
            var type = computerAccess.GetAddressType(address, 0);
            //lock (ByType)
                ByType[type].WriteUShort(address, value);
        }
        public void WriteBlock(int startAddress, byte[] data, int count)
        {
            var type = computerAccess.GetAddressType(startAddress, 0);
            //lock (ByType)
            ByType[type].WriteBlock(data, 0, startAddress, count);
        }
         public void WriteBlock(MemoryAddressType type, byte[] data, int startOffset, int startTargetAddress, int count)
        {
            ByType[type].WriteBlock(data, startOffset, startTargetAddress, count);
        }


        public virtual ProcessorStackModel ReadStack(int bytesCount)
        {
            var sp = 238;
            int data = 0x0100;// sp + 1 | 0x100;
            var readBlock = ReadBlock(data, bytesCount);
            var stackBytes = new ProcessorStackItemModel[bytesCount];
            for (int i = 0; i < bytesCount; i++)
            {
                var address = data++ & 0xFFFF;
                byte sp1 = readBlock[i]; //ReadByte((ushort)address, 0);
                byte data1 = sp1;
                var item = new ProcessorStackItemModel
                {
                    Address = address,
                    Data1 = data1,
                };
                stackBytes[i] = item;
            }
            var returnData = new ProcessorStackModel
            {
                Datas = stackBytes,
                Count = bytesCount,
                StartAddress = sp
            };
            return returnData;
        }

        public void SetWriteAudioMethod(Action<int, int> writeAudio)
        {
            ((IAudioMemory)ByType[MemoryAddressType.YM2151]).SetWriteAudioMethod(writeAudio);
        }
    }
}
