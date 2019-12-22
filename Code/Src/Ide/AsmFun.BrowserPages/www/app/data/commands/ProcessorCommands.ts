// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { BaseCommand } from './CommandsCommon.js'
import { IEditorFile, IEditorLine } from '../EditorData.js';

export class ProcessorOpenDebuggerCommand extends BaseCommand {
    public state: boolean | null;
    public constructor(state: boolean | null) {
        super();
        this.state = state;
        this.commandName = "OpenDebugger";
        this.nameSpace = "Processor";
    }
}
export class ProcessorNextStepCommand extends BaseCommand {
    public constructor() {
        super();
        this.commandName = "NextStep";
        this.nameSpace = "Processor";
    }
}
export class ProcessorStepOverCommand extends BaseCommand {
    public constructor() {
        super();
        this.commandName = "StepOver";
        this.nameSpace = "Processor";
    }
}
export class ProcessorDebuggerRunCommand extends BaseCommand {
    public constructor() {
        super();
        this.commandName = "DebuggerRun";
        this.nameSpace = "Processor";
    }
}
export class ProcessorReloadValuesCommand extends BaseCommand {
    public constructor() {
        super();
        this.commandName = "ReloadValues";
        this.nameSpace = "Processor";
    }
}
export class ProcessorDebuggerSetBreakpointCommand extends BaseCommand {
    public file: IEditorFile | null;
    public line: IEditorLine | null;
    public constructor(file: IEditorFile | null, line: IEditorLine | null) {
        super();
        this.file = file;
        this.line = line;
        this.commandName = "DebuggerSetBreakpoint";
        this.nameSpace = "Processor";
    }
}