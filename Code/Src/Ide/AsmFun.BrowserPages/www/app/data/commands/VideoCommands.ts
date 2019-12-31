﻿// #region license
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