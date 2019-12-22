// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { Guid } from "../../common/System.js";



export interface ICommandType {
    nameSpace: string;
    commandName: string;
}
export interface IBaseCommand {
    commandId: Guid;
    getFullName(): string;
    GetType(): ICommandType;
}

export class BaseCommand implements IBaseCommand {
    public commandId: Guid = Guid.NewGuid();
    protected nameSpace: string = "";
    protected commandName: string = "";

    public GetType(): ICommandType {
        return {
            nameSpace: this.nameSpace,
            commandName: this.commandName
        } 
    }
    public getFullName() {
        return this.nameSpace + "." + this.commandName;
    }
}