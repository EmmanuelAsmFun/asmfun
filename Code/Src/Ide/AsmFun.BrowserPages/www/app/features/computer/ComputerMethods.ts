
import { ICommandManager } from "../../framework/ICommandManager.js";
import { ComputerOpenManagerCommand, ComputerStartCommand, ComputerStopCommand, ComputerResetCommand, ComputerLoadProgramCommand, ComputerRunProgramCommand, ComputerOpenDetailCommand, ComputerUpdateStateCommand } from "./commands/ComputerCommands.js";

var commmandManager: ICommandManager;
export function SetCommandManager(commmandManager1: ICommandManager) {
    commmandManager = commmandManager1;
}
export default ComputerMethods;
export class ComputerMethods { }



// Emulator
export function ComputerOpenManager(state: boolean | null) { commmandManager.InvokeCommand(new ComputerOpenManagerCommand(state)); }
export function ComputerStart() { commmandManager.InvokeCommand(new ComputerStartCommand()); }
export function ComputerStop() { commmandManager.InvokeCommand(new ComputerStopCommand()); }
export function ComputerReset() { commmandManager.InvokeCommand(new ComputerResetCommand()); }
export function ComputerLoadProgram() { commmandManager.InvokeCommand(new ComputerLoadProgramCommand()); }
export function ComputerRunProgram() { commmandManager.InvokeCommand(new ComputerRunProgramCommand()); }
export function ComputerOpenDetail(state: boolean | null) { commmandManager.InvokeCommand(new ComputerOpenDetailCommand(state)); }
export function ComputerUpdateState(state: boolean | null) { commmandManager.InvokeCommand(new ComputerUpdateStateCommand()); }
