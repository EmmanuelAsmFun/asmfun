import { BaseCommand } from "../../../framework/commands/CommandsCommon.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion


export class ASMFunPlayerOpenManagerCommand extends BaseCommand {
    public state: boolean | null;
    public constructor(state: boolean | null) {
        super();
        this.state = state;
        this.commandName = "OpenManager";
        this.nameSpace = "ASMFunPlayer";
    }
}
export class ASMFunPlayerSelectOSCommand extends BaseCommand {
    public osName: string;
    public constructor(osName: string) {
        super();
        this.osName = osName;
        this.commandName = "SelectOS";
        this.nameSpace = "ASMFunPlayer";
    }
}
export class IdeSelectCodeNavTabCommand extends BaseCommand {
    public tabName: string;
    public constructor(tabName: string) {
        super();
        this.tabName = tabName;
        this.commandName = "SelectCodeNavTab";
        this.nameSpace = "Ide";
    }
}