﻿import { BaseCommand } from "../../../framework/commands/CommandsCommon.js";
import { BaseEvent } from "../../../framework/data/EventsCommon.js";
import { IDebuggerBreakpoint, IBreakpointUIData } from "../data/BreakPointsData.js";
import { IUILine } from "../../editor/ui/IUILine.js";
import { IUIFile } from "../../editor/ui/IUIFile.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion


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
export class ProcessorDbgBreakCommand extends BaseCommand {
    public constructor() {
        super();
        this.commandName = "DebuggerBreak";
        this.nameSpace = "Processor";
    }
}
export class ProcessorDbgSwapOnlyMyCodeCommand extends BaseCommand {
    public constructor() {
        super();
        this.commandName = "DebuggerSwapOnlyMyCode";
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
    public file: IUIFile | null;
    public line: IUILine | null;
    public constructor(file: IUIFile | null, line: IUILine | null) {
        super();
        this.file = file;
        this.line = line;
        this.commandName = "DebuggerSetBreakpoint";
        this.nameSpace = "Processor";
    }
}
export class ProcessorBreakpointSwapStateCommand extends BaseCommand {
    public breakpoint: IBreakpointUIData | null;
    public constructor(breakpoint: IBreakpointUIData | null) {
        super();
        this.breakpoint = breakpoint;
        this.commandName = "BreakpointSwapState";
        this.nameSpace = "Processor";
    }
}
export class ProcessorBreakpointSetByAddressCommand extends BaseCommand {
    public breakpointAddress: string | null;
    public state: boolean = false;
    public constructor(breakpointAddress: string | null, state: boolean = false) {
        super();
        this.breakpointAddress = breakpointAddress;
        this.state = state;
        this.commandName = "BreakpointSwapState";
        this.nameSpace = "Processor";
    }
}

export class ProcessorBreakPointsChanged extends BaseEvent {
    public breakpoints: IDebuggerBreakpoint[] | null;
    constructor(breakpoints: IDebuggerBreakpoint[] | null) {
        super();
        this.breakpoints = breakpoints;
        this.eventName = "BreakPointsChanged";
        this.nameSpace = "Processor";
    }
}