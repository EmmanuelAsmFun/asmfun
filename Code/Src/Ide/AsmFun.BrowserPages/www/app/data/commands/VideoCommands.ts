// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { BaseCommand } from './CommandsCommon.js'

export class VideoOpenManagerCommand extends BaseCommand {
    public state: boolean | null;
    public constructor(state: boolean | null) {
        super();
        this.state = state;
        this.commandName = "OpenManager";
        this.nameSpace = "Video";
    }
}
export class VideoReloadAllCommand extends BaseCommand {
    public constructor() {
        super();
        this.commandName = "VideoReloadAll";
        this.nameSpace = "Video";
    }
}
export class VideoEnableAutoReloadCommand extends BaseCommand {
    public state: boolean | null;
    public constructor(state: boolean | null) {
        super();
        this.state = state;
        this.commandName = "EnableAutoReload";
        this.nameSpace = "Video";
    }
}
export class VideoEnableKeyForwardingCommand extends BaseCommand {
    public state: boolean | null;
    public constructor(state: boolean | null) {
        super();
        this.state = state;
        this.commandName = "EnableKeyForwarding";
        this.nameSpace = "Video";
    }
}
export class VideoShowMemoryHexCommand extends BaseCommand {
    public state: boolean | null;
    public constructor(state: boolean | null) {
        super();
        this.state = state;
        this.commandName = "ShowMemoryHex";
        this.nameSpace = "Video";
    }
}
export class VideoMemoryDumpCommand extends BaseCommand {
    public constructor() {
        super();
        this.commandName = "MemoryDump";
        this.nameSpace = "Video";
    }
}
export class VideoPaletteDumpCommand extends BaseCommand {
    public constructor() {
        super();
        this.commandName = "PaletteDump";
        this.nameSpace = "Video";
    }
}