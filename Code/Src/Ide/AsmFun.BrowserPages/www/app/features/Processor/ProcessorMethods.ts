

import { ICommandManager } from "../../framework/ICommandManager.js";
import { ProcessorOpenDebuggerCommand, ProcessorStepOverCommand, ProcessorDebuggerRunCommand, ProcessorReloadValuesCommand, ProcessorDebuggerSetBreakpointCommand, ProcessorNextStepCommand, ProcessorBreakpointSwapStateCommand, ProcessorBreakpointSetByAddressCommand } from "./commands/ProcessorCommands.js";
import { IBreakpointUIData } from "./data/BreakPointsData.js";

var commmandManager: ICommandManager;
export function SetCommandManager(commmandManager1: ICommandManager) {
    commmandManager = commmandManager1;
}
export default ProcessorMethods;
export class ProcessorMethods { }



// Processor & Debugger
export function SwapShowDebugger() { commmandManager.InvokeCommand(new ProcessorOpenDebuggerCommand(null)); }
export function DbgNextStep() { commmandManager.InvokeCommand(new ProcessorNextStepCommand()); }
export function DbgStepOver() { commmandManager.InvokeCommand(new ProcessorStepOverCommand()); }
export function DbgRun() { commmandManager.InvokeCommand(new ProcessorDebuggerRunCommand()); }
export function DbgLoadLabelValues() { commmandManager.InvokeCommand(new ProcessorReloadValuesCommand()); }
export function DbgSetBreakpointCurrentLine(file, line) { commmandManager.InvokeCommand(new ProcessorDebuggerSetBreakpointCommand(file, line)); }
export function DbgBreakpointSwapState(breakpoint: IBreakpointUIData) { commmandManager.InvokeCommand(new ProcessorBreakpointSwapStateCommand(breakpoint)); }
export function DbgBreakpointSetByAddress(address: string, state: boolean) { commmandManager.InvokeCommand(new ProcessorBreakpointSetByAddressCommand(address,state)); }

