import { BaseCommand } from "../../../framework/commands/CommandsCommon.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion


export class DocumentationOpenManagerCommand extends BaseCommand {
    public state: boolean | null;
    public hiliteLastLine: boolean | null;
    public constructor(state: boolean | null, hiliteLastLine:boolean | null) {
        super();
        this.state = state;
        this.hiliteLastLine = hiliteLastLine;
        this.commandName = "OpenManager";
        this.nameSpace = "Documentation";
    }
}