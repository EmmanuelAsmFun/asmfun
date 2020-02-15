

import { ICommandManager } from "../../framework/ICommandManager.js";
import { ASMFunPlayerOpenManagerCommand, ASMFunPlayerSelectOSCommand } from "./commands/ASMFunPlayerManagerCommands.js";

var commmandManager: ICommandManager;
export function SetCommandManager(commmandManager1: ICommandManager) {
    commmandManager = commmandManager1;
}
export default PlayerMethods;
export class PlayerMethods { }

// ASMFun player manager
export function ASMFunPlayerOpenManager(state: boolean | null) { commmandManager.InvokeCommand(new ASMFunPlayerOpenManagerCommand(state)); }
export function ASMFunPlayerSelectOS(osName: string) { commmandManager.InvokeCommand(new ASMFunPlayerSelectOSCommand(osName)); }


