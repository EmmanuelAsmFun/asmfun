// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { Guid } from "../common/System.js";



export interface IAsmFunEventType {
    nameSpace: string;
    eventName: string;
}
export interface IAsmFunBaseEvent {
    eventId: Guid;
    getFullName(): string;
    GetType(): IAsmFunEventType;
}

export class BaseEvent implements IAsmFunBaseEvent {
    public eventId: Guid = Guid.NewGuid();
    protected nameSpace: string = "";
    protected eventName: string = "";

    public GetType(): IAsmFunEventType {
        return {
            nameSpace: this.nameSpace,
            eventName: this.eventName
        }
    }
    public getFullName() {
        return this.nameSpace + "." + this.eventName;
    }
}