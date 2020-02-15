
import { LayerSelectCommand, LayerChangeVisibilityCommand } from "./commands/LayerCommands.js";
import { PainterOpenManagerCommand, PainterSelectToolCommand } from "./commands/PainterCommands.js";
import { IUILayer } from "./data/LayerDatas.js";
import { ICommandManager } from "../../framework/ICommandManager.js";

var commmandManager: ICommandManager;
export function SetCommandManager(commmandManager1: ICommandManager) {
    commmandManager = commmandManager1;
}
export default PainterMethods;
export class PainterMethods { }

export function PainterOpenManager(state: boolean | null) { commmandManager.InvokeCommand(new PainterOpenManagerCommand(state)); }
export function PainterSelectTool(toolName: string | null) { commmandManager.InvokeCommand(new PainterSelectToolCommand(toolName)); }
export function LayerChangeVisibility(layer: IUILayer | null, state: boolean) { commmandManager.InvokeCommand(new LayerChangeVisibilityCommand(layer, state)); }
export function LayerSelect(layer: IUILayer | null) { commmandManager.InvokeCommand(new LayerSelectCommand(layer)); }

