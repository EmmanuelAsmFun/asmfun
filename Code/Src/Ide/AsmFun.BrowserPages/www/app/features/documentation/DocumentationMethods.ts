
import { DocumentationOpenManagerCommand }
    from "./commands/DocumentationCommands.js";
import { ICommandManager } from "../../framework/ICommandManager.js";

var commmandManager: ICommandManager;
export function SetCommandManager(commmandManager1: ICommandManager) {
    commmandManager = commmandManager1;
}
export default DocumentationMethods;
export class DocumentationMethods { }

// Documentation
export function DocumentationOpenManager(state: boolean | null) { commmandManager.InvokeCommand(new DocumentationOpenManagerCommand(state)); }
