// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { BaseCommand } from './CommandsCommon.js'

export class MemoryOpenManagerCommand extends BaseCommand {
    public state: boolean | null;
    public constructor(state: boolean | null) {
        super();
        this.state = state;
        this.commandName = "OpenManager";
        this.nameSpace = "Memory";
    }
}

export class MemoryScrollCommand extends BaseCommand {
    public deltaY: number;
    public constructor(deltaY: number) {
        super();
        this.deltaY = deltaY;
        this.commandName = "Scroll";
        this.nameSpace = "Memory";
    }
}
export class MemoryNextPageCommand extends BaseCommand {
    public factor: number;
    public constructor(factor: number) {
        super();
        this.factor = factor;
        this.commandName = "NextPage";
        this.nameSpace = "Memory";
    }
}
export class MemoryPreviousPageCommand extends BaseCommand {
    public factor: number;
    public constructor(factor: number) {
        super();
        this.factor = factor;
        this.commandName = "PreviousPage";
        this.nameSpace = "Memory";
    }
}
export class MemoryItemHoverCommand extends BaseCommand {
    public index: number;
    public address: number;
    public value: number;
    public constructor(index: number, address: number, value: number) {
        super();
        this.index = index;
        this.address = address;
        this.value = value;
        this.commandName = "ItemHover";
        this.nameSpace = "Memory";
    }
}