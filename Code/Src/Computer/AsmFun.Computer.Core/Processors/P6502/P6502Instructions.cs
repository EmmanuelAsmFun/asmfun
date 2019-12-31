// This file is heavely inspired by Mike Chambers (miker00lz@gmail.com) fake6502.c
// Heavely inspired from https://github.com/commanderx16/x16-emulator
using AsmFun.Common.Processors;
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Data.Computer;
using AsmFun.Computer.Common.Processors;

namespace AsmFun.Computer.Core.Processors.P6502
{

    public class P6502Instructions : IProcessorInstructions
    {


        protected ProcessorData pData;
        protected IComputerMemoryAccess computerMemory;
        protected IProcessor processor;

        public byte status { get => pData.Status; set => pData.Status = value; }


        public P6502Instructions(ProcessorData processorData, IComputerMemoryAccess computerMemory)
        {
            pData = processorData;
            this.computerMemory = computerMemory;
            
        }
        public void Init(IProcessor processor)
        {
            this.processor = processor;
        }




        /// <summary>
        /// Title: Add with carry
        /// Affects Flags: N V Z C
        /// Description: ADC results are dependant on the setting of the decimal flag.
        /// In decimal mode, addition is carried out on the assumption that the values involved are packed BCD (Binary Coded Decimal).
        /// Ticks: + add 1 cycle if page boundary crossed
        /// </summary>
        public virtual void Adc()
        {
            ushort result;
            pData.PenaltyOperation = 1;
            if ((status & P6502Flags.FLAG_DECIMAL) != 0)
            {
                ushort tmp;
                ushort tmp2;
                var theValue = processor.GetValue();
                tmp = (ushort)((pData.A & 0x0F) + (theValue & 0x0F) + (ushort)(status & P6502Flags.FLAG_CARRY));
                tmp2 = (ushort)((pData.A & 0xF0) + (theValue & 0xF0));
                if (tmp > 0x09)
                {
                    tmp2 += 0x10;
                    tmp += 0x06;
                }
                if (tmp2 > 0x90)
                {
                    tmp2 += 0x60;
                }
                if ((tmp2 & 0xFF00) != 0)
                    processor.SetCarry();
                else
                    processor.ClearCarry();
                result = (ushort)(tmp & 0x0F | tmp2 & 0xF0);

                processor.CalculateSign(result);

                pData.ClockTicks++;
            }
            else
            {
                var theValue = processor.GetValue();
                result = (ushort)(pData.A + theValue + (ushort)(status & P6502Flags.FLAG_CARRY));

                processor.CalculateCarry(result);
                processor.CalculateZero(result);
                processor.CalculateOverflow(result, pData.A, theValue);
                processor.CalculateSign(result);
            }

            processor.SaveAccumulator(result);
        }


        /// <summary>
        /// Title: Bitwise AND with accumulator
        /// Affects Flags: N Z
        /// Ticks: + add 1 cycle if page boundary crossed
        /// </summary>
        public virtual void And()
        {
            pData.PenaltyOperation = 1;
            var theValue = processor.GetValue();
            var result = (ushort)(pData.A & theValue);

            processor.CalculateZero(result);
            processor.CalculateSign(result);

            processor.SaveAccumulator(result);
        }


        /// <summary>
        /// Title: Arithmetic Shift Left
        /// Affects Flags: N Z C
        /// Description: ASL shifts all bits left one position. 0 is shifted into bit 0 and the original bit 7 is shifted into the Carry.
        /// </summary>
        public virtual void Asl()
        {
            var theValue = processor.GetValue();
            var result = (ushort)(theValue << 1);

            processor.CalculateCarry(result);
            processor.CalculateZero(result);
            processor.CalculateSign(result);

            processor.PutValue(result);
        }


        /// <summary>
        /// Title: Test BITs
        /// Affects Flags: N V Z
        /// Description: BIT sets the Z flag as though the value in the address tested were ANDed with the accumulator. 
        /// The S and V flags are set to match bits 7 and 6 respectively in the value stored at the tested address.
        /// BIT is often used to skip one or two following bytes.
        /// 
        /// Beware: pData.a BIT instruction used in this way as pData.a NOP does have effects: the flags may be modified, and the read 
        /// of the absolute address, if it happens to access an I/O device, may cause an unwanted action.
        /// </summary>
        public virtual void Bit()
        {
            var theValue = processor.GetValue();
            var result = (ushort)(pData.A & theValue);

            processor.CalculateZero(result);
            status = (byte)(status & 0x3F | (byte)(theValue & 0xC0));
        }

        /// <summary>
        /// Title: Branch on PLus
        /// </summary>
        public virtual void Bpl()
        {
            if ((status & P6502Flags.FLAG_SIGN) != 0)
                return;
            pData.PreviousPC = pData.ProgramCounter;
            pData.ProgramCounter += pData.RelativeAddress;
            AdvanceClock();
        }

        public virtual void Bcc()
        {
            if ((status & P6502Flags.FLAG_CARRY) != 0)
                return;
            pData.PreviousPC = pData.ProgramCounter;
            pData.ProgramCounter += pData.RelativeAddress;
            AdvanceClock();
        }

        public virtual void Bcs()
        {
            if ((status & P6502Flags.FLAG_CARRY) != P6502Flags.FLAG_CARRY)
                return;
            pData.PreviousPC = pData.ProgramCounter;
            pData.ProgramCounter += pData.RelativeAddress;
            AdvanceClock();
        }

        public virtual void Beq()
        {
            if ((status & P6502Flags.FLAG_ZERO) != P6502Flags.FLAG_ZERO)
                return;
            pData.PreviousPC = pData.ProgramCounter;
            pData.ProgramCounter += pData.RelativeAddress;
            AdvanceClock();
        }



        public virtual void Bmi()
        {
            if ((status & P6502Flags.FLAG_SIGN) != P6502Flags.FLAG_SIGN)
                return;
            pData.PreviousPC = pData.ProgramCounter;
            pData.ProgramCounter += pData.RelativeAddress;
            AdvanceClock();
        }

        public virtual void Bne()
        {
            if ((status & P6502Flags.FLAG_ZERO) != 0)
                return;
            pData.PreviousPC = pData.ProgramCounter;
            pData.ProgramCounter += pData.RelativeAddress;
            AdvanceClock();
        }



        public virtual void Brk()
        {
            pData.ProgramCounter++;
            // Push next instruction address onto stack
            processor.StackPushUShort(pData.ProgramCounter);
            // Push CPU status to stack
            processor.StackPushByte((byte)(status | P6502Flags.FLAG_BREAK));
            processor.SetInterrupt();
            pData.ProgramCounter = computerMemory.ReadUShort(0xFFFE);
        }



        public virtual void Bvc()
        {
            if ((status & P6502Flags.FLAG_OVERFLOW) != 0)
                return;
            pData.PreviousPC = pData.ProgramCounter;
            pData.ProgramCounter += pData.RelativeAddress;
            AdvanceClock();
        }

        public virtual void Bvs()
        {
            if ((status & P6502Flags.FLAG_OVERFLOW) != P6502Flags.FLAG_OVERFLOW)
                return;
            pData.PreviousPC = pData.ProgramCounter;
            pData.ProgramCounter += pData.RelativeAddress;
            AdvanceClock();
        }

        public virtual void Clc()
        {
            processor.ClearCarry();
        }

        public virtual void Cld()
        {
            processor.ClearDecimal();
        }



        public virtual void Cli()
        {
            processor.ClearInterrupt();
        }


        public virtual void Clv()
        {
            processor.ClearOverflow();
        }



        public virtual void Cmp()
        {
            pData.PenaltyOperation = 1;
            var theValue = processor.GetValue();
            var result = (ushort)(pData.A - theValue);

            if (pData.A >= (byte)(theValue & 0x00FF))
                processor.SetCarry();
            else
                processor.ClearCarry();
            if (pData.A == (byte)(theValue & 0x00FF))
                processor.SetZero();
            else
                processor.ClearZero();
            processor.CalculateSign(result);
        }

        public virtual void Cpx()
        {
            var theValue = processor.GetValue();
            var result = (ushort)(pData.X - theValue);

            if (pData.X >= (byte)(theValue & 0x00FF))
                processor.SetCarry();
            else
                processor.ClearCarry();
            if (pData.X == (byte)(theValue & 0x00FF))
                processor.SetZero();
            else
                processor.ClearZero();
            processor.CalculateSign(result);
        }

        public virtual void Cpy()
        {
            var theValue = processor.GetValue();
            var result = (ushort)(pData.Y - theValue);

            if (pData.Y >= (byte)(theValue & 0x00FF))
                processor.SetCarry();
            else
                processor.ClearCarry();
            if (pData.Y == (byte)(theValue & 0x00FF))
                processor.SetZero();
            else
                processor.ClearZero();
            processor.CalculateSign(result);
        }



        public virtual void Dec()
        {
            var theValue = processor.GetValue();
            var result = (ushort)(theValue - 1);

            processor.CalculateZero(result);
            processor.CalculateSign(result);

            processor.PutValue(result);
        }
        public virtual void Dex()
        {
            pData.X--;

            processor.CalculateZero(pData.X);
            processor.CalculateSign(pData.X);
        }

        public virtual void Dey()
        {
            pData.Y--;

            processor.CalculateZero(pData.Y);
            processor.CalculateSign(pData.Y);
        }

        public virtual void Eor()
        {
            pData.PenaltyOperation = 1;
            var theValue = processor.GetValue();
            var result = (ushort)(pData.A ^ theValue);

            processor.CalculateZero(result);
            processor.CalculateSign(result);

            processor.SaveAccumulator(result);
        }

        public virtual void Inc()
        {
            var theValue = processor.GetValue();
            var result = (ushort)(theValue + 1);

            processor.CalculateZero(result);
            processor.CalculateSign(result);

            processor.PutValue(result);
        }

        public virtual void Inx()
        {
            pData.X++;

            processor.CalculateZero(pData.X);
            processor.CalculateSign(pData.X);
        }

        public virtual void Iny()
        {
            pData.Y++;

            processor.CalculateZero(pData.Y);
            processor.CalculateSign(pData.Y);
        }

        public virtual void Jmp()
        {
            pData.ProgramCounter = pData.EA;
        }

        public virtual void Jsr()
        {
            processor.StackPushUShort((ushort)(pData.ProgramCounter - 1));
            pData.ProgramCounter = pData.EA;
        }


        public virtual void Lda()
        {
            pData.PenaltyOperation = 1;
            var theValue = processor.GetValue();
            pData.A = (byte)(theValue & 0x00FF);

            processor.CalculateZero(pData.A);
            processor.CalculateSign(pData.A);
        }

        public virtual void Ldx()
        {
            pData.PenaltyOperation = 1;
            var theValue = processor.GetValue();
            pData.X = (byte)(theValue & 0x00FF);

            processor.CalculateZero(pData.X);
            processor.CalculateSign(pData.X);
        }

        public virtual void Ldy()
        {
            pData.PenaltyOperation = 1;
            var theValue = processor.GetValue();
            pData.Y = (byte)(theValue & 0x00FF);

            processor.CalculateZero(pData.Y);
            processor.CalculateSign(pData.Y);
        }

        public virtual void Lsr()
        {
            var theValue = processor.GetValue();
            var result = (ushort)(theValue >> 1);

            if ((theValue & 1) != 0)
                processor.SetCarry();
            else
                processor.ClearCarry();
            processor.CalculateZero(result);
            processor.CalculateSign(result);

            processor.PutValue(result);
        }

        public virtual void Nop()
        {
            switch (pData.Opcode)
            {
                case 0x1C:
                case 0x3C:
                case 0x5C:
                case 0x7C:
                case 0xDC:
                case 0xFC:
                    pData.PenaltyOperation = 1;
                    break;
            }
        }

        public virtual void Ora()
        {
            pData.PenaltyOperation = 1;
            var theValue = processor.GetValue();
            var result = (ushort)(pData.A | theValue);

            processor.CalculateZero(result);
            processor.CalculateSign(result);

            processor.SaveAccumulator(result);
        }

        public virtual void Pha()
        {
            processor.StackPushByte(pData.A);
        }



        public virtual void Php()
        {
            processor.StackPushByte((byte)(status | P6502Flags.FLAG_BREAK));
        }

        public virtual void Pla()
        {
            pData.A = processor.StackPullByte();

            processor.CalculateZero(pData.A);
            processor.CalculateSign(pData.A);
        }


        public virtual void Plp()
        {
            status = (byte)(processor.StackPullByte() | P6502Flags.FLAG_CONSTANT);
        }

        public virtual void Rol()
        {
            var theValue = processor.GetValue();
            var result = (ushort)(theValue << 1 | status & P6502Flags.FLAG_CARRY);

            processor.CalculateCarry(result);
            processor.CalculateZero(result);
            processor.CalculateSign(result);

            processor.PutValue(result);
        }

        public virtual void Ror()
        {
            var theValue = processor.GetValue();
            var result = (ushort)(theValue >> 1 | (status & P6502Flags.FLAG_CARRY) << 7);

            if ((theValue & 1) != 0)
                processor.SetCarry();
            else
                processor.ClearCarry();

            processor.CalculateZero(result);
            processor.CalculateSign(result);

            processor.PutValue(result);
        }

        public virtual void Rti()
        {
            status = processor.StackPullByte();
            var theValue = processor.StackPullShort();
            pData.ProgramCounter = theValue;
        }

        public virtual void Rts()
        {
            var theValue = processor.StackPullShort();
            pData.ProgramCounter = (ushort)(theValue + 1);
        }



        public virtual void Sbc()
        {
            pData.PenaltyOperation = 1;
            ushort result = 0;
            if ((status & P6502Flags.FLAG_DECIMAL) != 0)
            {
                var theValue = processor.GetValue();
                result = (ushort)(pData.A - (theValue & 0x0f) + (status & P6502Flags.FLAG_CARRY) - 1);
                if ((result & 0x0f) > (pData.A & 0x0f))
                {
                    result -= 6;
                }
                result -= (ushort)(theValue & 0xf0);
                if ((result & 0xfff0) > (pData.A & 0xf0))
                {
                    result -= 0x60;
                }
                if (result <= pData.A)
                    processor.SetCarry();
                else
                    processor.ClearCarry();

                processor.CalculateSign(result);

                pData.ClockTicks++;
            }
            else
            {
                var theValue = (ushort)(processor.GetValue() ^ 0x00FF);
                result = (ushort)(pData.A + theValue + (ushort)(status & P6502Flags.FLAG_CARRY));

                processor.CalculateCarry(result);
                processor.CalculateZero(result);
                processor.CalculateOverflow(result, pData.A, theValue);
                processor.CalculateSign(result);
            }

            processor.SaveAccumulator(result);
        }

        public virtual void Sec()
        {
            processor.SetCarry();
        }

        public virtual void Sed()
        {
            processor.SetDecimal();
        }



        public virtual void Sei()
        {
            processor.SetInterrupt();
        }


        public virtual void Sta()
        {
            processor.PutValue(pData.A);
        }

        public virtual void Stx()
        {
            processor.PutValue(pData.X);
        }

        public virtual void Sty()
        {
            processor.PutValue(pData.Y);
        }

        public virtual void Tax()
        {
            pData.X = pData.A;

            processor.CalculateZero(pData.X);
            processor.CalculateSign(pData.X);
        }

        public virtual void Tay()
        {
            pData.Y = pData.A;

            processor.CalculateZero(pData.Y);
            processor.CalculateSign(pData.Y);
        }

        public virtual void Tsx()
        {
            pData.X = pData.StackPointer;

            processor.CalculateZero(pData.X);
            processor.CalculateSign(pData.X);
        }

        public virtual void Txa()
        {
            pData.A = pData.X;

            processor.CalculateZero(pData.A);
            processor.CalculateSign(pData.A);
        }

        public virtual void Txs()
        {
            pData.StackPointer = pData.X;
        }

        public virtual void Tya()
        {
            pData.A = pData.Y;

            processor.CalculateZero(pData.A);
            processor.CalculateSign(pData.A);
        }



        


        protected void AdvanceClock()
        {
            if ((pData.PreviousPC & 0xFF00) != (pData.ProgramCounter & 0xFF00))
                pData.ClockTicks += 2;
            else
                pData.ClockTicks++;
        }
    }
}
