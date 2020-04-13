
import { ICommandManager } from "../../framework/ICommandManager.js";
import { EditorEnableCommand, EditorSelectFileCommand, EditorSwapOutputCommand, EditorReloadLineCommand, EditorScrollToLineCommand, EditorInsertVariableSetterCommand } from "./commands/EditorCommands.js";
import { FindReplaceOpenManagerCommand, FindReplaceSearchNextCommand, FindReplaceReplaceNextCommand } from "./commands/FindReplaceCommands.js";
import { IUILine } from "./ui/IUILine.js";
import { IUIFile } from "./ui/IUIFile.js";

var commmandManager: ICommandManager;
export function SetCommandManager(commmandManager1: ICommandManager) {
    commmandManager = commmandManager1;
}
export default EditorMethods;
export class EditorMethods { }

// Editor
export function SetEditorEnable(state: boolean) { commmandManager.InvokeCommand(new EditorEnableCommand(state)); }
export function SelectFile(file: IUIFile | null) { commmandManager.InvokeCommand(new EditorSelectFileCommand(file)); }
export function SwapOutputWindow() { commmandManager.InvokeCommand(new EditorSwapOutputCommand(null)); }
export function EditorReloadLine(line: IUILine) { commmandManager.InvokeCommand(new EditorReloadLineCommand(line)); }
export function EditorScrollToLine(line: IUILine | null) { commmandManager.InvokeCommand(new EditorScrollToLineCommand(line)); }

// FindAndReplace
export function FindReplaceOpenManager(state: boolean) { commmandManager.InvokeCommand(new FindReplaceOpenManagerCommand(state)); }
export function FindReplaceSearch() { commmandManager.InvokeCommand(new FindReplaceSearchNextCommand()); }
export function FindReplaceReplaceNext() { commmandManager.InvokeCommand(new FindReplaceReplaceNextCommand()); }
export function EditorInsertVariableSetter(code: string | null, addressHex: string | null, name: string | null) {
    return commmandManager.InvokeCommand(new EditorInsertVariableSetterCommand(code, addressHex, name));
}