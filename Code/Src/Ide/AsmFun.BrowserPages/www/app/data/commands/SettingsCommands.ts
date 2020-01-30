// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { BaseCommand } from './CommandsCommon.js'

export class SettingsOpenManagerCommand extends BaseCommand {
    public state: boolean | null;
    public constructor(state: boolean | null) {
        super();
        this.state = state;
        this.commandName = "OpenManager";
        this.nameSpace = "Settings";
    }
}

export class SettingsSelectCompilerFileCommand extends BaseCommand {
    public type: string | null;
    public constructor(type: string | null) {
        super();
        this.type = type;
        this.commandName = "SelectCompiler";
        this.nameSpace = "Settings";
    }
}