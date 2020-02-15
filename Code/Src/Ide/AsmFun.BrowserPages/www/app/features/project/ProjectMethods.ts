

import { ICommandManager } from "../../framework/ICommandManager.js";
import {
    ProjectSaveFolderCommand, ProjectCreateNewCommand, ProjectRequestLoadProgramCommand, ProjectLoadWebCommand, ProjectLoadLocalCommand,
    ProjectOpenProjectWebsiteCommand, ProjectRequestCreateNewCommand, ProjectOpenManagerCommand, ProjectSaveCommand
} from "./commands/ProjectsCommands.js";
import { IProjectDetail } from "./data/ProjectData.js";
import { MainScreenMethods } from "../../ui/MainScreenMethods.js";

var commmandManager: ICommandManager;
export function SetCommandManager(commmandManager1: ICommandManager) {
    commmandManager = commmandManager1;
}
export default ProjectMethods;
export class ProjectMethods { }



// Project manager
export function ProjectOpenManager(state: boolean | null) { commmandManager.InvokeCommand(new ProjectOpenManagerCommand(state)); }
export function ProjectSaveFolder() { commmandManager.InvokeCommand(new ProjectSaveFolderCommand()); }
export function ProjectCreateNew() { commmandManager.InvokeCommand(new ProjectCreateNewCommand()); }
export function ProjectRequestLoadProgram() { commmandManager.InvokeCommand(new ProjectRequestLoadProgramCommand()); }
export function ProjectRequestCreateNew() { commmandManager.InvokeCommand(new ProjectRequestCreateNewCommand()); }
export function ProjectLoadWeb(detail: IProjectDetail | null) { commmandManager.InvokeCommand(new ProjectLoadWebCommand(detail)); }
export function ProjectLoadLocal(detail: IProjectDetail | null) { commmandManager.InvokeCommand(new ProjectLoadLocalCommand(detail)); }
export function ProjectOpenProjectWebsite(detail: IProjectDetail | null) { commmandManager.InvokeCommand(new ProjectOpenProjectWebsiteCommand(detail)); }

// Todo: remove this!!!
export function SaveProject() {
    var mainData = MainScreenMethods.S.mainData;
    if (mainData.sourceCode == null || mainData.sourceCode.files == null || mainData.sourceCode.files.length === 0)
        return;
    MainScreenMethods.ExecuteCommand(new ProjectSaveCommand(mainData.sourceCode));
}