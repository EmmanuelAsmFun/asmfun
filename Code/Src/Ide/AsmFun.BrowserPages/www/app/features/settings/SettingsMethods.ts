
import { SettingsOpenManagerCommand, SettingsSelectCompilerFileCommand }
    from "./commands/SettingsCommands.js";
import { ICommandManager } from "../../framework/ICommandManager.js";
import { UserSaveUserSettingsCommand } from "../project/commands/ProjectsCommands.js";

var commmandManager: ICommandManager;
export function SetCommandManager(commmandManager1: ICommandManager) {
    commmandManager = commmandManager1;
}
export default SettingsMethods;
export class SettingsMethods { }

// Settings
export function SettingsOpenManager(state: boolean | null) { commmandManager.InvokeCommand(new SettingsOpenManagerCommand(state)); }
export function SettingsSelectCompilerFile(type: string) { commmandManager.InvokeCommand(new SettingsSelectCompilerFileCommand(type)); }
export function UserSaveUserSettings() { commmandManager.InvokeCommand(new UserSaveUserSettingsCommand()); }
