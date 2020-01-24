// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { NotifyIconName, ErrorIconName, ConfirmIconName, ErrorCode } from "./Enums.js";
import { LiteEvent } from "./LiteEvent.js";
import { Action } from "./System.js";



export interface IAlertMessages {
    Notify(message: string, icon: NotifyIconName);
    NotifyWithDuration(message: string, icon: NotifyIconName, duration: number);
    ShowError(title: string, message: string, icon: ErrorIconName, confirmAction?: Action<boolean>, errorCode?: ErrorCode);
    Confirm(title: string, message: string, icon: ConfirmIconName, confirmAction?: Action<boolean>, yesText?: string, noText?: string);

    ErrorOccurred: LiteEvent<AlertMessageErrorData>;
}
export class AlertMessageErrorData {
    public Title: string = "";
    public Message: string = "";
    public Icon?: ErrorIconName;
    public ErrorCode?: ErrorCode;
}

