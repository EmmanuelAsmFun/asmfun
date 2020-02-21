using AsmFun.Common.Processors;
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Memory;
using AsmFun.Computer.Common.Processors;
using AsmFun.Computer.Common.Video;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace AsmFun.CommanderX16.Computer
{

    public class X16ProgramAccess : IProgramAccess
	{
		internal ushort FA = 0x000280;
		internal ushort FNLEN = 0x00027D;
		internal ushort FNADR = 0x000084;
		internal ushort STATUS = 0x000275;
		internal ushort SA = 0x00027F;

		private readonly IComputerMemoryAccess memoryAccess;
		private readonly IProcessor processor;
		private readonly ProcessorData processorData;
		private readonly IVideoAccess videoAccess;
		private string startFolder;
		private List<MemoryDumpData> _usedMemoryBlocks = new List<MemoryDumpData>();

		public X16ProgramAccess(IComputerMemoryAccess memoryAccess, IProcessor processor, ProcessorData processorData, ISymbolsDA symbolsDA, IVideoAccess videoAccess)
		{
			this.memoryAccess = memoryAccess;
			this.processor = processor;
			this.processorData = processorData;
			this.videoAccess = videoAccess;
			FA = symbolsDA.GetAsShort(nameof(FA));
			FNLEN = symbolsDA.GetAsShort(nameof(FNLEN));
			FNADR = symbolsDA.GetAsShort(nameof(FNADR));
			STATUS = symbolsDA.GetAsShort(nameof(STATUS));
			SA = symbolsDA.GetAsShort(nameof(SA));
		}

		public void SetStartFolder(string folder)
		{
			startFolder = folder;
		}

        public void Step()
		{
			var pc = processorData.ProgramCounter;
			if (pc != 0xffd5 && (pc != 0xffd8 || !processor.IsKernal())) return;

			int check = memoryAccess.ReadByte(FA); // RAM[FA];
			if (check != 1 && check != 8) return;

			if (pc == 0xffd5)
				Load();
			else
			{
				//SAVE();
			}
			var bytes = memoryAccess.ReadBlock(MemoryAddressType.RAM,(ushort)(0x100 + processorData.StackPointer + 1),2 );
			var newPc = (bytes[0] | (bytes[1] << 8)) + 1;
			processorData.ProgramCounter = (ushort)newPc;
			processorData.StackPointer += 2;
		}

		private void Load()
		{
			var memoryBlock = new MemoryDumpData();
			memoryBlock.MemoryType = MemoryAddressType.Unknown;
			var fnLength = memoryAccess.ReadByte(FNLEN);
			var fnAddr = memoryAccess.ReadUShort(FNADR);
			var fnAddBytes = memoryAccess.ReadBlock(fnAddr, fnLength);
			var fileName = System.Text.Encoding.ASCII.GetString(fnAddBytes);
			var fullFileName = Path.Combine(startFolder, fileName);
			if (string.IsNullOrWhiteSpace(fileName) || !File.Exists(fullFileName))
			{
				processorData.A = 4; // FNF
				memoryAccess.WriteByte(STATUS, processorData.A);
				processorData.Status |= 1;
				return;
			}
			memoryBlock.Name = fileName;

			var fileBytes = File.ReadAllBytes(fullFileName);
			var override_start = processorData.X | (processorData.Y << 8);
			var sa = memoryAccess.ReadByte(SA);
			int start;
			if (sa == 0)
				start = override_start;
			else
				start = fileBytes[1] << 8 | fileBytes[0];
			memoryBlock.StartAddress = start;
			int bytes_read = 0; 
			var ramEndAddress = memoryAccess.GetEndAddress(MemoryAddressType.RAM);
			var bankedRamEndAddress = memoryAccess.GetEndAddress(MemoryAddressType.BankedRAM);
			memoryBlock.EndAddress = ramEndAddress;
			memoryBlock.EndAddressForUI = bankedRamEndAddress;
			if (processorData.A > 1)
			{
				// Video RAM
				memoryBlock.StartAddress = start;
				memoryAccess.WriteVideo( 0, (byte)(start & 0xff));
				memoryAccess.WriteVideo( 1, (byte)(start >> 8));
				memoryAccess.WriteVideo( 2, (byte)(((processorData.A - 2) & 0xf) | 0x10));
				for (int i = 2; i < fileBytes.Length; i++)
				{
					memoryAccess.WriteVideo(3, fileBytes[i]);
					bytes_read++;
				}
				memoryBlock.EndAddress = memoryBlock.StartAddress + fileBytes.Length-2;
				memoryBlock.MemoryType = MemoryAddressType.Video;
				//System.Console.WriteLine(" - 0x" + start.ToString("X2") + " - 0x" + memoryBlock.EndAddress.ToString("X2"));
			}
			else if (start < ramEndAddress)
			{
				// Fixed RAM
				// Write all ram with zero from start
				memoryAccess.WriteRAM(new byte[ramEndAddress-start], 0, start, ramEndAddress-start);
				// Write the program without first two bytes.
				memoryAccess.WriteRAM(fileBytes, 2, start, fileBytes.Length - 2);
				bytes_read = fileBytes.Length -2;
				memoryBlock.MemoryType = MemoryAddressType.RAM;
				memoryBlock.EndAddress = start + bytes_read;
			}
			else if (start < 0xa000)
			{
				// IO addresses
			}
			else if (start < bankedRamEndAddress)
			{
				// banked RAM
				var numOfRequiredBanks = (int)Math.Floor((float)(fileBytes.Length / 0x2000));
				memoryAccess.WriteBlock(MemoryAddressType.BankedRAM, fileBytes, 2, start + (memoryAccess.RamBank <<13), fileBytes.Length - 2);
				bytes_read = fileBytes.Length - 2;
				//while (true)
				//{
				//	var len = bankedRamEndAddress - start;
				//	var startAddress = memoryAccess.RamBank << 13 + start;
				//	memoryAccess.WriteBlock(MemoryAddressType.BankedRAM, fileBytes,2, startAddress, len);
				//	//bytes_read = fread(RAM + ((uint16_t)memory_get_ram_bank() << 13) + start, 1, len, f);
				//	if (bytes_read < len) break;

				//	// Wrap into the next bank
				//	start = 0xa000;
				//	memoryAccess.RamBank = 1 + memoryAccess.RamBank;
				//	//memory_set_ram_bank(1 + memory_get_ram_bank());
				//}
				memoryAccess.RamBank += numOfRequiredBanks; // =8192
				memoryBlock.StartAddress = start + (memoryAccess.RamBank << 13);
				memoryBlock.EndAddress = memoryBlock.StartAddress + fileBytes.Length -2;
				memoryBlock.MemoryType = MemoryAddressType.BankedRAM;
			}
			else
			{
				// ROM
			}
			
			var end = start + bytes_read;
			processorData.X =  (byte)(end & 0xff);
			processorData.Y = (byte)(end >> 8);
			processorData.Status &= 0xfe;
			memoryAccess.WriteByte(STATUS, 0);
			processorData.A = 0;
			if (memoryBlock.MemoryType != MemoryAddressType.Unknown)
			{
				var exists = _usedMemoryBlocks.FirstOrDefault(item => item.Name == memoryBlock.Name);
				if (exists == null)
					_usedMemoryBlocks.Add(memoryBlock);
				else
				{
					var index = _usedMemoryBlocks.IndexOf(exists);
					_usedMemoryBlocks[index] = memoryBlock;
				}
			}
		}

		private byte MIN(byte a, byte b) => (a < b) ? a : b;
		private byte MAX(byte a, byte b) => (a > b) ? a : b;

		public List<MemoryDumpData> GetLoadedMemoryBlocks()
		{
			var ordered = _usedMemoryBlocks.OrderBy(x => x.MemoryType).OrderBy(x => x.StartAddress).ToList();
			return ordered;
		}
	}
}
