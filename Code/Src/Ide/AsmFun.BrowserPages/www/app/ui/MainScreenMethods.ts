// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

// TODO : clean up this mess

import { EditorEnableCommand } from "../features/editor/commands/EditorCommands.js";
import { ProjectSaveCommand } from "../features/project/commands/ProjectsCommands.js";
import { IBaseCommand } from "../framework/commands/CommandsCommon.js";
import { IMainData } from "../framework/data/MainData.js";
import { IUIProperty } from "../features/editor/data/IPropertiesData.js";



export class MainScreenMethods {

    public static S: MainScreenMethods;
    public mainData: IMainData;
    public lastEditedLabel?: IUIProperty | null;

    constructor(mainData: IMainData) {
        this.mainData = mainData;
        MainScreenMethods.S = this;
    }
    public SetEditorEnable(state: boolean) { MainScreenMethods.ExecuteCommand(new EditorEnableCommand(state)); }
    public SaveProject() {
        var mainData = MainScreenMethods.S.mainData;
        MainScreenMethods.ExecuteCommand(new ProjectSaveCommand());
    }



    public static ExecuteCommand(command: IBaseCommand) {
        MainScreenMethods.S.mainData.commandManager.InvokeCommand(command);
    }


  
}
