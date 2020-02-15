import { BaseCommand } from "../../../framework/commands/CommandsCommon.js";
import { BaseEvent } from "../../../framework/data/EventsCommon.js";
import { IProcessorData } from "../../processor/data/ProcessorData.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion


export class ComputerOpenManagerCommand extends BaseCommand {
    public state: boolean | null;
    public constructor(state: boolean | null) {
        super();
        this.state = state;
        this.commandName = "OpenManager";
        this.nameSpace = "Computer";
    }
}
export class ComputerOpenDetailCommand extends BaseCommand {
    public state: boolean | null;
    public constructor(state: boolean | null) {
        super();
        this.state = state;
        this.commandName = "OpenDetail";
        this.nameSpace = "Computer";
    }
}
export class ComputerUpdateStateCommand extends BaseCommand {
    constructor() {
        super();
        this.commandName = "UpdateState";
        this.nameSpace = "Computer";
    }
}
export class ComputerStartCommand extends BaseCommand {
    constructor() {
        super();
        this.commandName = "Start";
        this.nameSpace = "Computer";
    }
}
export class ComputerStopCommand extends BaseCommand {
    constructor() {
        super();
        this.commandName = "Stop";
        this.nameSpace = "Computer";
    }
}
export class ComputerResetCommand extends BaseCommand {
    constructor() {
        super();
        this.commandName = "Reset";
        this.nameSpace = "Computer";
    }
}
export class ComputerLoadProgramCommand extends BaseCommand {
    constructor() {
        super();
        this.commandName = "LoadProgram";
        this.nameSpace = "Computer";
    }
}
export class ComputerRunProgramCommand extends BaseCommand {
    constructor() {
        super();
        this.commandName = "RunProgram";
        this.nameSpace = "Computer";
    }
}
export class ComputerProcessorDataChanged extends BaseEvent {
    public processorData: IProcessorData | null;
    constructor(processorData: IProcessorData | null) {
        super();
        this.processorData = processorData;
        this.eventName = "ProcessorDataChanged";
        this.nameSpace = "Computer";
    }
}
export class ComputerStarted extends BaseEvent {
    constructor() {
        super();
        this.eventName = "Started";
        this.nameSpace = "Computer";
    }
}