
import {
    MemoryOpenManagerCommand, MemoryScrollCommand, MemoryItemHoverCommand, MemoryEditCommand, MemoryNextPageCommand, MemoryPreviousPageCommand,
    MemorySelectPageCommand
} from "./commands/MemoryCommands.js";
import { ICommandManager } from "../../framework/ICommandManager.js";

var commmandManager: ICommandManager;
export function SetCommandManager(commmandManager1: ICommandManager) {
    commmandManager = commmandManager1;
}
export default PainterMethods;
export class PainterMethods { }

// Memory
export function MemoryOpenManager(state: boolean | null) { commmandManager.InvokeCommand(new MemoryOpenManagerCommand(state)); }
export function MemoryScroll(element) { commmandManager.InvokeCommand(new MemoryScrollCommand(element.deltaY)); }
export function MemoryItemHover(index: number, address: number, value: number) { commmandManager.InvokeCommand(new MemoryItemHoverCommand(index, address, value)); }
export function MemoryEdit(address: number, el?: HTMLElement) { commmandManager.InvokeCommand(new MemoryEditCommand(address, el)); }
export function NextMemoryPage(factor: number) { commmandManager.InvokeCommand(new MemoryNextPageCommand(factor)); }
export function PreviousMemoryPage(factor: number) { commmandManager.InvokeCommand(new MemoryPreviousPageCommand(factor)); }
export function SelectMemoryPage(startAddress: number) { commmandManager.InvokeCommand(new MemorySelectPageCommand(startAddress)); }



