// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { BaseCommand } from './CommandsCommon.js'


export class DebuggerResetCommand extends BaseCommand {
    constructor() {
        super();
        this.commandName = "Reset";
        this.nameSpace = "Debugger";
    }
}
export class DebuggerStepOverCommand extends BaseCommand {
    constructor() {
        super();
        this.commandName = "StepOver";
        this.nameSpace = "Debugger";
    }
}
export class DebuggerStepInCommand extends BaseCommand {
    constructor() {
        super();
        this.commandName = "StepIn";
        this.nameSpace = "Debugger";
    }
}