#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Core.Tools;
using AsmFun.Computer.Common.Computer.Data;
using System;
using System.Collections.Generic;
using System.IO;
using System.Runtime.InteropServices;

namespace AsmFun.Computer.Core.DataAccess.Computer
{
    public class MemoryDataAccessDeffered : MemoryDataAccess
    {
        private Func<int, int, byte> readMethod;
        private Action<int, int, byte> writeMethod;

        public MemoryDataAccessDeffered(IntPtr data, int length) : base(data, length) { }
        public void Init(Func<int, int, byte> readMethod, Action<int, int, byte> writeMethod)
        {
            this.readMethod = readMethod;
            this.writeMethod = writeMethod;
            Reset();
        }


        public override byte ReadByte(ushort address, int bank)
        {
            var newAddress = ReturnOffset(true, address, bank);
            return readMethod(newAddress, bank);
        }


        public override void WriteByte(ushort address, int bank, byte value)
        {
            var newAddress = ReturnOffset(false, address, bank);
            writeMethod(newAddress, bank, value);
        }
        public virtual byte ReadMemByte(int address)
        {
            return Marshal.ReadByte(Data + address);
        }
        public virtual void WriteMemByte(int address, byte value)
        {
            Marshal.WriteByte(Data + address, value);
        }
    }
    public class MemoryDataAccess : IDisposable
    {
        protected IntPtr Data { get; set; }
        public MemoryAddressType Type { get; set; }
        public int Start { get; set; }
        public int End { get; set; }
        public int Length { get; set; }
        public Func<bool, ushort, int, int> ReturnOffset { get; set; }


        public MemoryDataAccess(IntPtr data, int length)
        {
            if (data == IntPtr.Zero) return;
            Data = data;
            ReturnOffset = (isRead, address, bank) => address;
            Length = length;

        }
        Dictionary<int, string> RomLines = new Dictionary<int, string>();
        private class RomL
        {
            public int Address { get; set; }
            public string Name { get; set; }
        }

        public virtual void Reset()
        {
            if (Data == null || Type== MemoryAddressType.BankedRAM || Type == MemoryAddressType.RAM) return;
            for (int i = 0; i < Length; i++)
                Marshal.WriteByte(Data + i, 0);
        }

        public virtual void SetData(IntPtr data)
        {
            Data = data;
        }

        public virtual byte ReadByte(ushort address, int bank)
        {
            //try
            //{
                var newAddress = ReturnOffset(true, address, bank);
                //if (Type == MemoryAddressType.BankedROM)

                //    if (RomLines.Count == 0)
                //        LoadRomLines();
                //if (RomLines.ContainsKey(newAddress))
                //{
                //    var line = RomLines[newAddress];
                //    Console.WriteLine(line);
                //}


                return Marshal.ReadByte(Data + newAddress);
            //}
            //catch (Exception)
            //{
            //    return 0;
            //}
           
        }
        private void LoadRomLines()
        {
            if (Type == MemoryAddressType.BankedROM)
            {
                var file = @"D:\Projects\AsmFun\Code\src\AsmFun.CommanderX16\X16\R33\rom.sym";
                var lines = File.ReadAllLines(file);
                for (int i = 0; i < lines.Length; i++)
                {
                    var parts = lines[i].Split(' ');
                    if (parts.Length < 3)
                        continue;
                    var nummm = int.Parse(parts[1], System.Globalization.NumberStyles.HexNumber);
                    if (!RomLines.ContainsKey(nummm))
                        RomLines.Add(nummm, parts[2]);
                }
            }
        }
        public virtual void WriteByte(ushort address, int bank, byte value)
        {
            var newAddress = ReturnOffset(false, address, bank);
            Marshal.WriteByte(Data + newAddress, value);
        }

        public virtual void WriteBlock(byte[] bytes, int startOffset)
        {
            Marshal.Copy(bytes, startOffset, Data, bytes.Length);
        }
        public virtual void WriteBlock(byte[] bytes, int sourceOffest, int targetOffset, int length)
        {
            Marshal.Copy(bytes, sourceOffest, Data + targetOffset, length);
        }

        public virtual void Dispose()
        {
            if (Data == IntPtr.Zero) return;
            Marshal.FreeHGlobal(Data);
        }

        public virtual int GetRealMemoryAddress()
        {
            //var ptr = Data.ToPointer();
            var ddd = Data;
            return 0;
        }
        public virtual void TraceData(int offset, int length)
        {
            ConsoleDataAnalyerHelper.Dump(Data, offset, length);
        }

        public virtual byte[] ReadBlock(int address, int length)
        {
            var newAddress = ReturnOffset(true, (ushort)address, 0);
            var buffer = new byte[length];
            Marshal.Copy(Data + newAddress, buffer, 0, length);
            return buffer;
        }

        public virtual ushort ReadUShort(int address)
        {
            var newAddress = ReturnOffset(true, (ushort)address, 0);
            var shortt = (ushort)Marshal.ReadInt16(Data + newAddress);
            return shortt;
        }

        public virtual void WriteUShort(int address, ushort value)
        {
            var newAddress = ReturnOffset(true, (ushort)address, 0);
            Marshal.WriteInt16(Data + newAddress,(short) value);
        }
    }
}
