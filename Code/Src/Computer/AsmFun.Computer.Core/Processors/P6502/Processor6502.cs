// This file is heavely inspired by Mike Chambers (miker00lz@gmail.com) fake6502.c
// Heavely inspired from https://github.com/commanderx16/x16-emulator
using AsmFun.Common.Processors;
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Data.Computer;
using AsmFun.Computer.Common.Debugger;
using AsmFun.Computer.Common.Processors;
using System.Linq;

namespace AsmFun.Computer.Core.Processors.P6502
{


    public class Processor6502<TInstructions, TModes> : IProcessor
        where TInstructions : IProcessorInstructions
        where TModes : IProcessorModes
    {
        protected ProcessorData pData;
        protected IComputerMemoryAccess computerMemory;
        protected TModes modes;
        protected TInstructions instructions;
        protected InstructionDB<TInstructions, TModes> instructionDB;
        private IDebugger debugger;

        public Processor6502(ProcessorData processorData, TModes modes, TInstructions instructions, IComputerMemoryAccess computerMemory,
            InstructionDB<TInstructions, TModes> instructionsdb)
        {
            instructionDB = instructionsdb;
            
            this.modes = modes;
            this.computerMemory = computerMemory;
            this.instructions = instructions;
            pData = processorData;
        }

        public void Init(IDebugger debugger)
        {
            this.debugger = debugger;
        }


        public void Reset()
        {
            pData.ProgramCounter = (ushort)(Read(0xFFFC) | Read(0xFFFD) << 8);
            pData.A = 0;
            pData.X = 0;
            pData.Y = 0;
            pData.StackPointer = 0xFD;
            pData.Status |= P6502Flags.FLAG_CONSTANT;
        }


        public void Step()
        {
            pData.Opcode = Read(pData.ProgramCounter++);
            pData.Status |= P6502Flags.FLAG_CONSTANT;
#if DEBUG
            if (pData.instructionsCount >= 86300)
            {
                //var name = optable[opcode].Name;
                //if (name == "bne") Console.WriteLine();
                //if (name.Length < 4)
                //    name = " " + name;
                //Console.Write(name + ":" + pc + "=" + value + ":" + ea + ":");
            }
#endif
            pData.PenaltyOperation = 0;
            pData.PenaltyAddress = 0;
            var opCodeData = instructionDB[pData.Opcode];
            pData.CurrentAddressName = opCodeData.OpcodeModeName;
            opCodeData.AddressAction(modes);
            opCodeData.OpcodeAction(instructions);

            pData.ClockTicks += opCodeData.Ticks;
            if (pData.PenaltyOperation > 0 && pData.PenaltyAddress > 0)
                pData.ClockTicks++;
            pData.ClockGoal = pData.ClockTicks;

            pData.instructionsCount++;
        }

        private byte Read(ushort address)
        {
            return computerMemory.ReadByte(address);
        }


        public void TriggerVideoIrq()
        {
            StackPushUShort(pData.ProgramCounter);
            StackPushByte(pData.Status & ~P6502Flags.FLAG_BREAK);
            pData.Status |= P6502Flags.FLAG_INTERRUPT;
            pData.ProgramCounter = computerMemory.ReadUShort(0xFFFE);
        }

        private byte[] kernaldata = new byte[4] { 77, 73, 83, 84 }; // = text 'MIST'
        public bool IsKernal()
        {
            var bytes = computerMemory.ReadBlock(0xfff6, 4);
            var areSame = kernaldata.SequenceEqual(bytes);
            return areSame;
        }


        public void SaveAccumulator(ushort n) => pData.A = (byte)(n & 0x00FF);


        #region Set Flags

        public void SetCarry()
        {
            pData.Status |= P6502Flags.FLAG_CARRY;
            pData.IsCarry = true;
        }
        public void ClearCarry()
        {
            pData.Status &= unchecked((byte)~P6502Flags.FLAG_CARRY);
            pData.IsCarry = false;
        }
        public void SetZero()
        {
            pData.Status |= P6502Flags.FLAG_ZERO;
            pData.IsZero = true;
        }
        public void ClearZero()
        {
            pData.IsZero = false;
            pData.Status &= unchecked((byte)~P6502Flags.FLAG_ZERO);
        }
        public void SetInterrupt()
        {
            pData.IsInterrupt = true;
            pData.Status |= P6502Flags.FLAG_INTERRUPT;
        }
        public void ClearInterrupt()
        {
            pData.IsInterrupt = false;
            pData.Status &= unchecked((byte)~P6502Flags.FLAG_INTERRUPT);
        }
        public void SetDecimal()
        {
            pData.IsDecimal = true;
            pData.Status |= P6502Flags.FLAG_DECIMAL;
        }
        public void ClearDecimal()
        {
            pData.IsDecimal = false;
            pData.Status &= unchecked((byte)~P6502Flags.FLAG_DECIMAL);
        }
        public void SetOverflow()
        {
            pData.IsOverflow = true;
            pData.Status |= P6502Flags.FLAG_OVERFLOW;
        }
        public void ClearOverflow()
        {
            pData.IsOverflow = false;
            pData.Status &= unchecked((byte)~P6502Flags.FLAG_OVERFLOW);
        }
        public void SetSign()
        {
            pData.IsSign = true;
            pData.Status |= P6502Flags.FLAG_SIGN;
        }
        public void ClearSign()
        {
            pData.IsSign = false;
            pData.Status &= unchecked((byte)~P6502Flags.FLAG_SIGN);
        }

        #endregion



        #region Calculate flag

        public void CalculateZero(ushort n)
        {
            if ((n & 0x00FF) > 0)
                ClearZero();
            else
                SetZero();
        }

        public void CalculateSign(ushort n)
        {
            if ((n & 0x0080) > 0)
                SetSign();
            else
                ClearSign();
        }

        public void CalculateCarry(ushort n)
        {
            if ((n & 0xFF00) > 0)
                SetCarry();
            else
                ClearCarry();
        }

        public void CalculateOverflow(ushort result, byte a, ushort value)
        {
            CalculateOverflow((byte)result, a, (byte)value);
        }

        public void CalculateOverflow(ushort n, ushort m, ushort o)
        {
            if (((n ^ m) & (n ^ o) & 0x0080) > 0)
                SetOverflow();
            else
                ClearOverflow();
        }
        #endregion



        #region Stack

        public void StackPushUShort(ushort pushval)
        {
            computerMemory.WriteUShort(P6502Flags.BASE_STACK + pData.StackPointer - 1, pushval);
            pData.StackPointer -= 2;
        }

        public ushort StackPullShort()
        {
            var theValue = computerMemory.ReadUShort(P6502Flags.BASE_STACK + 1 + pData.StackPointer);
            pData.StackPointer += 2;
            return theValue;
        } 
        public ushort StackReadShort()
        {
            var theValue = computerMemory.ReadUShort(P6502Flags.BASE_STACK + 1 + pData.StackPointer);
            return theValue;
        }

        public void StackPushByte(byte value)
        {
            computerMemory.WriteByte((ushort)(P6502Flags.BASE_STACK + pData.StackPointer--), value);
        }

        public void StackPushByte(int value)
        {
            computerMemory.WriteByte((ushort)(P6502Flags.BASE_STACK + pData.StackPointer--), (byte)value);
        }

        public byte StackPullByte()
        {
            return computerMemory.ReadByte((ushort)(P6502Flags.BASE_STACK + ++pData.StackPointer));
        }

        #endregion


        public void PutValue(ushort value)
        {
            if (pData.CurrentAddressName == "acc")
                pData.A = (byte)(value & 0x00FF);
            else
                computerMemory.WriteByte(pData.EA, (byte)(value & 0x00FF));
        }
        public ushort GetValue()
        {
            if (pData.CurrentAddressName == "acc")
                return pData.A;
            else
                return computerMemory.ReadByte(pData.EA);
        }


        public ushort GetValue16()
        {
            return computerMemory.ReadUShort(pData.EA);
        }

        public bool IsOnReadyAddress()
        {
            //var ok = pData.ProgramCounter == 0xffcf && IsKernal();
            //return ok;
            var nok = pData.ProgramCounter != 0xffcf || !IsKernal();
            return nok;
        }

        public void BreakFromProgram()
        {
            debugger.BreakFromProgram(pData.ProgramCounter);
        }
    }
}
