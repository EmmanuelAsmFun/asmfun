import { ICommandManager } from "../../framework/ICommandManager.js";
import { VideoOpenManagerCommand, VideoReloadAllCommand, VideoMemoryDumpCommand, VideoShowMemoryHexCommand, VideoEnableAutoReloadCommand, VideoEnableKeyForwardingCommand, VideoPaletteDumpCommand } from "./commands/VideoCommands.js";

var commmandManager: ICommandManager;
export function SetCommandManager(commmandManager1: ICommandManager) {
    commmandManager = commmandManager1;
}
export default VideoMethods;
export class VideoMethods { }

// Video
export function VideoOpenManager(state: boolean | null) { commmandManager.InvokeCommand(new VideoOpenManagerCommand(state)); }
export function VideoReloadAll() { commmandManager.InvokeCommand(new VideoReloadAllCommand()); }
export function VideoMemoryDump() { commmandManager.InvokeCommand(new VideoMemoryDumpCommand()); }
export function VideoEnableAutoReload(state: boolean | null) { commmandManager.InvokeCommand(new VideoEnableAutoReloadCommand(state)); }
export function VideoShowMemoryHex(state: boolean | null) { commmandManager.InvokeCommand(new VideoShowMemoryHexCommand(state)); }
export function VideoEnableKeyForwarding(state: boolean | null) { commmandManager.InvokeCommand(new VideoEnableKeyForwardingCommand(state)); }
export function VideoPaletteDump() { commmandManager.InvokeCommand(new VideoPaletteDumpCommand()); }