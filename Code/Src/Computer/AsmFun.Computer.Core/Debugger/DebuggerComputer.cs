#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Debugger;
using System.Collections.Generic;

namespace AsmFun.Computer.Core.Debugger
{
    public abstract class DebuggerComputer : IDebuggerInternal
    {
        public bool IsEnabled;

       

    
        public void ParseSourceCodeAddresses(List<ushort> addresses)
        {
          
        }

        public virtual bool Run()
        {
          
            return true;
        }

        public virtual void StepOver(bool onlyMyCode)
        {
           
        }
        public virtual void NextStep(bool onlyMyCode)
        {
           
        }
        public virtual void DoNextStep()
        {
        }

        public abstract bool DoBreak(ushort programCounter);
        public abstract bool SetBreakpoint(int index, int address, bool state, bool isEnabled);
        public abstract List<DebuggerBreakpoint> GetBreakPoints();
		public void BreakFromProgram(ushort address)
        {
         
        }
    }
}
