
import { ICommandManager } from "../../framework/ICommandManager.js";
import { IEditorFile, IEditorLine } from "./data/EditorData.js";
import { EditorEnableCommand, EditorSelectFileCommand, EditorSwapOutputCommand, EditorReloadLineCommand, EditorScrollToLineCommand } from "./commands/EditorCommands.js";
import { IUILine } from "./ui/IUILine.js";

var commmandManager: ICommandManager;
export function SetCommandManager(commmandManager1: ICommandManager) {
    commmandManager = commmandManager1;
}
export default EditorMethods;
export class EditorMethods { }

// Editor
export function SetEditorEnable(state: boolean) { commmandManager.InvokeCommand(new EditorEnableCommand(state)); }
export function SelectFile(file: IEditorFile) { commmandManager.InvokeCommand(new EditorSelectFileCommand(file)); }
export function SwapOutputWindow() { commmandManager.InvokeCommand(new EditorSwapOutputCommand(null)); }
export function EditorReloadLine(line) { commmandManager.InvokeCommand(new EditorReloadLineCommand(line)); }
export function EditorScrollToLine(line: IEditorLine | IUILine | null) { commmandManager.InvokeCommand(new EditorScrollToLineCommand(line)); }

