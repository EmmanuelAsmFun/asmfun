#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

namespace AsmFun.Common.Processors
{
    public interface IProcessor
    {
        void EnableDataLog(bool state);

        bool IsKernal();
        void Reset();
        void Step();
        void TriggerVideoIrq();


        void CalculateCarry(ushort n);
        void ClearCarry();
        void ClearDecimal();
        void ClearInterrupt();
        void ClearOverflow();
        void ClearSign();
        void ClearZero();
        void CalculateOverflow(ushort n, ushort m, ushort o);
        ushort StackPullShort();
        ushort StackReadShort();
        byte StackPullByte();
        void StackPushUShort(ushort value);
        void StackPushByte(byte value);
        void StackPushByte(int v);
        void SaveAccumulator(ushort n);
        void SetCarry();
        void SetDecimal();
        void SetInterrupt();
        void SetOverflow();
        void SetSign();
        void SetZero();
        void CalculateSign(ushort n);
        void CalculateZero(ushort n);

        void PutValue(ushort result);

        ushort GetValue();
        bool IsOnReadyAddress();
        void BreakFromProgram();
    }
}
