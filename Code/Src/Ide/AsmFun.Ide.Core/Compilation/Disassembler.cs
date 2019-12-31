#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
// Heavely inspired from https://github.com/commanderx16/x16-emulator
#endregion

using AsmFun.Common;
using AsmFun.Computer.Common.DataAccess;
using AsmFun.Ide.Common.Data.Dissasembly;
using System.Collections.Generic;

namespace AsmFun.Ide.Compilation
{
    public class Disassembler : IDisassembler
    {
        private readonly IAsmMemoryReader memoryReader;
        private readonly IMnemonics mnemonics;

        public Disassembler(IAsmMemoryReader memoryReader, IMnemonics mnemonics)
        {
            this.memoryReader = memoryReader;
            this.mnemonics = mnemonics;
        }

        public void ReadRange(DissasemblyRange dissasemblyRange)
        {
            if (dissasemblyRange.Count > 256) dissasemblyRange.Count = 256;
            if (dissasemblyRange.Count <= 0) dissasemblyRange.Count = 1;
            if (dissasemblyRange.StartAdress <= 0) dissasemblyRange.StartAdress = 1;
            dissasemblyRange.Instructions = new List<DissasemblyInstructionItem>();
            memoryReader.PrepareRange(dissasemblyRange.StartAdress, dissasemblyRange.Count, dissasemblyRange.Bank);
            for (ushort i = 0; i < dissasemblyRange.Count; i++)
            {
                var line = Read((ushort)(i+ dissasemblyRange.StartAdress), dissasemblyRange.Bank);
                line.LineText = (line.Address).ToString("X4") + "  " + line.OpcodeName + " " + line.DataString;
                dissasemblyRange.Instructions.Add(line);
            }
        }


        public DissasemblyInstructionItem Read(ushort pc, int bank)
        {
            var result = new DissasemblyInstructionItem();
            result.Address = pc;
            byte opcode = (byte)memoryReader.Read(pc, bank);
            result.Opcode = opcode;
            var mnemonic = mnemonics.GetByOpcode(opcode);
            var parts = mnemonic.Split(' ');
            result.OpcodeName = parts[0];
            result.IsBranch = (opcode == 0x80) || ((opcode & 0x1F) == 0x10);
            int length = 1;
            var line = mnemonic;
            if (line.Contains("%02x"))
            {
                length = 2;
                if (result.IsBranch)
                {
                    var readData = memoryReader.Read(pc + 1, bank);
                    var data = readData > 128 ? readData - 256 + pc + 2 : readData + pc + 2;
                    result.Data1 = data;
                    result.DataString = parts[1].Replace("%02x", data.ToString("X2"));
                }
                else
                {
                    var data = memoryReader.Read(pc + 1, bank);
                    result.Data1 = data;
                    result.DataString = parts[1].Replace("%02x", data.ToString("X2"));
                }
            }
            if (line.Contains("%04x"))
            {
                length = 3;
                var data = memoryReader.Read(pc + 1, bank) + memoryReader.Read(pc + 2, bank) * 256;
                result.Data1 = data;
                result.DataString = parts[1].Replace("%04x", data.ToString("X4"));
            }
            result.DataLength = length;
            return result;
        }
    }
}

