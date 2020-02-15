// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { ISpritesData } from "./data/SpritesData.js";
import { SpritesOpenManagerCommand } from "./commands/SpritesCommands.js";
import { IMainData } from "../../framework/data/MainData.js";
import { EditorEnableCommand } from "../editor/commands/EditorCommands.js";
import { ServiceName } from "../../framework/serviceLoc/ServiceName.js";
import { UIDataNameSprites } from "./VideoFactory.js";



export class SpritesManager {

    private mainData: IMainData;
    public data: ISpritesData;

    constructor(mainData: IMainData) {
        var thiss = this;
        this.mainData = mainData;
        this.data = mainData.GetUIData(UIDataNameSprites);
        this.mainData.commandManager.Subscribe2(new SpritesOpenManagerCommand(null), this, x => this.OpenManager(x.state));
    }

    private OpenManager(state: boolean | null) {
        if (state == null)
            state = !this.data.isVisible;
        if (state === this.data.isVisible) return;
        if (!state)
            this.Close();
        else
            this.Open();
    }


    private Open() {
        var thiss = this;
        this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(false));
        thiss.data.isVisible = true;
    }

    private Close() {
        this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(true));
        this.data.isVisible = false;
    }

    public static NewData(): ISpritesData {
        return {
            isVisible: false,
        };
    }

    public static ServiceName: ServiceName = { Name: "SpritesManager" };
}