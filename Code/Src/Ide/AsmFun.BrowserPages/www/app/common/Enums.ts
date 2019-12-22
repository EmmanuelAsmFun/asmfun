// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

export class GenericNameEnum {
    public Name: string;
    constructor(name: string) { this.Name = name; }
}
export const enum LogType {
    Unknown = 0,
    Normal = 1,
    Info = 2,
    Warning = 3,
    Error = 4,
}
export class ButtonTypeName extends GenericNameEnum{
}

export class IconName extends GenericNameEnum{
}
export class ErrorCode extends GenericNameEnum{
}

export class ErrorIconName extends IconName { }
export class NotifyIconName extends IconName { }
export class ConfirmIconName extends IconName { }

export module NotifyIcon {
    export var None = new NotifyIconName("None");
    export var Alert = new NotifyIconName("Alert");
    export var OK = new NotifyIconName("OK");
}

export module ConfirmIcon {
    export var None = new ConfirmIconName("None");
    export var Question = new ConfirmIconName("Question");
    export var Exclamation = new ConfirmIconName("Exclamation");
    export var OK = new ConfirmIconName("OK");
}

export module ErrorIcon {
    export var None = new ErrorIconName("None");
    export var Exclamation = new ErrorIconName("Exclamation");
}

export module ButtonType{
    export var None = new ButtonTypeName("None");
    export var Cancel = new ButtonTypeName("Cancel");
    export var Save = new ButtonTypeName("Save");
    export var Add = new ButtonTypeName("Add");
    export var Reload = new ButtonTypeName("Reload");
    export var MinimilizeAll = new ButtonTypeName("MinimilizeAll");
    export var MaximizeAll = new ButtonTypeName("MaximizeAll");
    export var Order = new ButtonTypeName("Order");
    export var Simulate = new ButtonTypeName("Simulate");
    export var Back = new ButtonTypeName("Back");
    export var Edit = new ButtonTypeName("Edit");
    export var Copy = new ButtonTypeName("Copy");
    export var Delete = new ButtonTypeName("Delete");
    export var Duplicate = new ButtonTypeName("Duplicate");
    export var Validate = new ButtonTypeName("Validate");
    export var Online = new ButtonTypeName("Online");
    export var Offline = new ButtonTypeName("Offline");
    export var View = new ButtonTypeName("View");
}
    
export module SubNavigationName {
    export var None = new GenericNameEnum("None");
}

export module ErrorCodes {
    export var None = new ErrorCode("Unkown");
}

