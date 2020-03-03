import { BaseCommand } from "../../../framework/commands/CommandsCommon.js";
import { BaseEvent } from "../../../framework/data/EventsCommon.js";
// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion


export class SourceCodeLoadedAndParsed extends BaseEvent {

    public constructor() {
        super();
        this.eventName = "LoadedAndParsed";
        this.nameSpace = "SourceCode";
    }
}