#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.Processors;
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Debugger;
using AsmFun.Computer.Common.Processors;
using AsmFun.Computer.Common.Video;
using System.Collections.Generic;
using System.Linq;
using System.Threading;

namespace AsmFun.Computer.Core.Debugger
{
    public abstract class DebuggerComputer : IDebuggerInternal
    {
        public bool IsEnabled;

        protected List<DebuggerBreakpoint> breakpoints = new List<DebuggerBreakpoint>();
        protected List<ushort> breakpointInts = new List<ushort>();
        protected List<ushort> sourceCodeAddresses = new List<ushort>();
        protected ushort nextProgramCounterToBreak;
        protected ushort currentProgramCounter;
        protected readonly ProcessorData processorData;
        protected readonly IComputerMemoryAccess computerMemory;
        protected readonly IVideoPainter videoPainter;
        protected readonly IProcessor processor;
        protected ushort breakpointFromProgram;
        private bool hasSetNextBreakPoint = false;
        private bool skipOnce = false;
        private bool wait = false;

        public DebuggerComputer(ProcessorData processorData,  IComputerMemoryAccess computerMemory, IVideoPainter videoPainter, IProcessor processor)
        {
            this.processorData = processorData;
            this.computerMemory = computerMemory;
            this.videoPainter = videoPainter;
            this.processor = processor;
        }

        public void ParseSourceCodeAddresses(List<ushort> addresses)
        {
            sourceCodeAddresses = addresses;
        }

        public virtual bool Run()
        {
            if (!IsEnabled) return false;
            try
            {
                wait = true;
                Thread.Sleep(10);
                nextProgramCounterToBreak = 0;
                hasSetNextBreakPoint = false;
                skipOnce = true;
            }
            finally
            {
                wait = false;
            }
           
            return true;
        }

        public virtual void StepOver(bool onlyMyCode)
        {
            if (!IsEnabled) return;
            try
            {
                wait = true;
                Thread.Sleep(10);
                if (onlyMyCode && sourceCodeAddresses.Count > 0)
                {
                    for (int i = 0; i < 1000; i++)
                    {
                        nextProgramCounterToBreak++;
                        if (sourceCodeAddresses.Contains(nextProgramCounterToBreak))
                            break;
                    }
                }
                else
                    nextProgramCounterToBreak++;
                skipOnce = true;
            }
            finally
            {
                wait = false;
            }
        }
        public virtual void NextStep(bool onlyMyCode)
        {
            if (!IsEnabled) return;
            try
            {
                nextProgramCounterToBreak = currentProgramCounter;
                wait = true;
                Thread.Sleep(10);
                if (onlyMyCode && sourceCodeAddresses.Count > 0)
                {
                    for (int i = 0; i < 1000; i++)
                    {
                        DoNextStep();
                        if (sourceCodeAddresses.Contains(nextProgramCounterToBreak))
                        {
                            break;
                        }
                    }
                }
                else
                    DoNextStep();
                skipOnce = true;
            }
            finally
            {
                wait = false;
            }
        }
        public virtual void DoNextStep()
        {
            var opcode = computerMemory.ReadByte(nextProgramCounterToBreak);
            ushort addressToJump;
            // check if it's a branch
            if (IsBranchToAddress(nextProgramCounterToBreak, opcode, out addressToJump))
            {
                nextProgramCounterToBreak = addressToJump;
            }
            else
                nextProgramCounterToBreak++;
        }
        protected abstract bool IsBranchToAddress(ushort currentAddress, byte opcode, out ushort addressToJump);

        public bool DoBreak(ushort programCounter)
        {
            if (!IsEnabled) return false;
            while (wait)
            {
                Thread.Sleep(10);
            }
            // Is there a breakpoint?
            var doBreak = nextProgramCounterToBreak == programCounter || programCounter == breakpointFromProgram;
            if (!doBreak)
            {
                if (!skipOnce && breakpointInts.Contains(programCounter))
                {
                    doBreak = true;
                    if (!hasSetNextBreakPoint)
                    {
                        // Keep the program counter so we can do next step later on
                        nextProgramCounterToBreak = programCounter;
                        hasSetNextBreakPoint = true;
                    }
                }
                skipOnce = false;
            }
            else
            {
                if (breakpointFromProgram > 0)
                {
                    nextProgramCounterToBreak = breakpointFromProgram;
                    breakpointFromProgram = 0;
                }
            }
            currentProgramCounter = programCounter;
            // Check if the state has chanaged
            //if (previousbreakState != doBreak)
            //{
            //    previousbreakState = doBreak;
            //    videoPainter.Break(doBreak);
            //}
            return doBreak;
        }

        protected virtual void StepProgramCounter()
        {
            nextProgramCounterToBreak++;
        }

        public virtual List<DebuggerBreakpoint> GetBreakPoints()
        {
            return new List<DebuggerBreakpoint>(breakpoints);
        }


        public virtual bool SetBreakpoint(int index, int address, bool state, bool isEnabled)
        {
            if (state)
                IsEnabled = true;
            if (state)
            {
                // Add breakpoint
                if (breakpoints.Count <= index)
                {
                    for (int i = 0; i <= index ; i++)
                    {
                        if (breakpoints.Count <= i)
                        {
                            if (i != index)
                            {
                                // Empty breakpoint
                                breakpoints.Add(new DebuggerBreakpoint { Address = 0, Index = i, IsEnabled = false });
                                breakpointInts.Add(0);
                            }
                            else
                            {
                                breakpoints.Add(new DebuggerBreakpoint { Address = address, Index = index, IsEnabled = isEnabled });
                                breakpointInts.Add((ushort)address);
                            }
                        }
                    }
                }
                else
                {
                    breakpoints[index].Address = address;
                    breakpoints[index].IsEnabled = isEnabled;
                    breakpointInts[index] = (ushort)(isEnabled ? address: 0);
                }
                UpdateAndSortIndexes();
                return true;
            }
            else
                hasSetNextBreakPoint = false;

            // Breakpoint disabled


            // Remove breakpoint
            if (breakpoints.Count <= index)
                return false;
            if (isEnabled)
            {
                breakpointInts[index] = 0;
            }
            else
            {
                breakpoints.RemoveAt(index);
                breakpointInts.RemoveAt(index);
            }
            var activeBreakPoints = breakpoints.Any(x => x.IsEnabled);
            if (!activeBreakPoints)
                IsEnabled = false;
            UpdateAndSortIndexes();
            return true;
        }

        private void UpdateAndSortIndexes()
        {
            breakpoints = breakpoints.OrderBy(x => x.Address).ToList();
            breakpointInts = breakpointInts.OrderBy(x => x).ToList();
            // update indexes
            for (int i = 0; i < breakpoints.Count; i++)
                breakpoints[i].Index = i;
        }

        public void BreakFromProgram(ushort address)
        {
            IsEnabled = true;
            breakpointFromProgram = address;
        }
    }
}
