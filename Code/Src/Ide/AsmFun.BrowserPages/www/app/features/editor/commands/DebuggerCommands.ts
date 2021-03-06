﻿// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion
import { BaseCommand } from "../../../framework/commands/CommandsCommon.js";


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