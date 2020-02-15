
import { ICommandManager } from "../../framework/ICommandManager.js";
import { IFileDialogData } from "./data/FileManagerData.js";
import { FileOpenManagerCommand } from "./commands/FileCommands.js";

var commmandManager: ICommandManager;
export function SetCommandManager(commmandManager1: ICommandManager) {
    commmandManager = commmandManager1;
}
export default FileManagerMethods;
export class FileManagerMethods { }

// File manager
export function FileOpenManager(state: boolean | null, fileDialogData: IFileDialogData | null) { commmandManager.InvokeCommand(new FileOpenManagerCommand(state, fileDialogData)); }


