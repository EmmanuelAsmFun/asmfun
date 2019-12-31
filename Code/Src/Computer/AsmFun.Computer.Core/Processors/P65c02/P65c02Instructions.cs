// // This file is heavely inspired by Mike Chambers (miker00lz@gmail.com) fake6502.c
// Heavely inspired from https://github.com/commanderx16/x16-emulator
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Data.Computer;
using AsmFun.Computer.Common.Processors;
using AsmFun.Computer.Core.Processors.P6502;

namespace AsmFun.Computer.Core.Processors.P65c02
{
    /// <summary>
    /// Differences 65C02 changes: 
    /// - Brk : Breakpoint
    /// - Adc/Sbc : Set N and Z in decimal mode. They also set V, but this is essentially meaningless so this has not been implemented.
    /// </summary>
    public class P65c02Instructions : P6502Instructions
    {
        public P65c02Instructions(ProcessorData processorData, IComputerMemoryAccess computerMemory) 
            : base(processorData, computerMemory)
        {
        }

        public override void Adc()
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

                processor.CalculateZero(result); // 65C02 change, Decimal Arithmetic sets NZV
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




        public override void Sbc()
        {
            pData.PenaltyOperation = 1;
            ushort result;
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

                processor.CalculateZero(result); // 65C02 change, Decimal Arithmetic sets NZV
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

        ///

        /// <summary>
        /// Title: BRanch Always
        /// Flags affected: none
        /// Ticks: 3
        /// </summary>
        public virtual void Bra()
        {
            pData.PreviousPC = pData.ProgramCounter;
            pData.ProgramCounter += pData.RelativeAddress;
            AdvanceClock();
        }

        /// <summary>
        /// Title: Push the Register X on the stack
        /// Ticks: 3 
        /// </summary>
        public virtual void Phx()
        {
            processor.StackPushByte(pData.X);
        }
        /// <summary>
        /// Title: Pulls the Register X from the stack
        /// Flags affected: N, Z
        /// Ticks: 4 
        /// </summary>
        public virtual void Plx()
        {
            pData.X = processor.StackPullByte();

            processor.CalculateZero(pData.X);
            processor.CalculateSign(pData.X);
        }
        /// <summary>
        /// Title: Push the Register Y on the stack
        /// Ticks: 3 
        /// </summary>
        public virtual void Phy()
        {
            processor.StackPushByte(pData.Y);
        }
        /// <summary>
        /// Title: Pulls the Register Y from the stack
        /// Flags affected: N, Z
        /// Ticks: 4 
        /// </summary>
        public virtual void Ply()
        {
            pData.Y = processor.StackPullByte();

            processor.CalculateZero(pData.Y);
            processor.CalculateSign(pData.Y);
        }

        /// <summary>
        /// Title: Store zero to memory
        /// Description: STZ is fairly straightforward. It stores $00 in the memory location specified in the operand.
        /// It's like STA when A=$00, but it doesn't require a register to be cleared beforehand. Note that the cycle counts
        /// are the same as STA.
        /// Flags affected: none
        /// Ticks: 3-5
        /// </summary>
        public virtual void Stz()
        {
            processor.PutValue(0);
        }



        /// <summary>
        /// Title: Test and Reset Bits
        /// Description: The term reset is used to refer to the clearing of a bit, whereas the term clear had been used consistently before,
        /// such as CLC which stands for CLear Carry. Second, the effect on the Z flag is determined by a different function than the effect 
        /// on memory.
        /// The accumulator determines which bits in the memory location specified in the operand are cleared and which are not affected.
        /// The bits in the accumulator that are ones are cleared(in memory), and the bits that are zeros(in the accumulator) are not 
        /// affected(in memory). This is the same as saying that the resulting memory contents are the bitwise AND of the memory contents 
        /// with the complement of the accumulator(i.e.the exclusive-or of the accululator with $FF). 
        /// Flags affected: Z
        /// </summary>
        public virtual void Trb()
        {
            var theValue = processor.GetValue();
            var result = (ushort)(pData.A & theValue);
            processor.CalculateZero(result);
            // Write back theValue read, A bits are clear.
            result = (ushort)(theValue & (pData.A ^ 0xFF));
            processor.PutValue(result);
        }
        /// <summary>
        /// Title: Test and Set Bits
        /// Flags affected: Z
        /// Description: the same effect on the Z flag that a BIT instruction does. Specifically, it is based on whether the result of a
        /// bitwise AND of the accumulator with the contents of the memory location specified in the operand is zero. Also, like BIT (and TRB),
        /// the accumulator is not affected.
        /// The accumulator determines which bits in the memory location specified in the operand are set and which are not affected.
        /// The bits in the accumulator that are ones are set to one(in memory), and the bits that are zeros(in the accumulator) are not 
        /// affected(in memory). This is the same as saying that the resulting memory contents are the bitwise OR of the memory contents 
        /// with the accumulator.
        /// </summary>
        public virtual void Tsb()
        {
            var theValue = processor.GetValue();
            var result = (ushort)(pData.A & theValue);
            processor.CalculateZero(result);
            result = (ushort)(theValue | pData.A);
            processor.PutValue(result);
        }

        /// <summary>
        /// Invoke the debugger
        /// </summary>
        public virtual void Dbg()
        {

        }

        public override void Brk()
        {
            pData.ProgramCounter++;
            // Push next instruction address onto stack
            processor.StackPushUShort(pData.ProgramCounter);
            // Push CPU status to stack
            processor.StackPushByte((byte)(status | P6502Flags.FLAG_BREAK));
            processor.SetInterrupt();
            processor.ClearDecimal(); // clear decimal flag (65C02 change)
            pData.ProgramCounter = computerMemory.ReadUShort(0xFFFE); 
        }

    }
}
