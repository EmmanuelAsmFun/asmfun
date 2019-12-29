// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { BaseCommand } from './CommandsCommon.js'

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