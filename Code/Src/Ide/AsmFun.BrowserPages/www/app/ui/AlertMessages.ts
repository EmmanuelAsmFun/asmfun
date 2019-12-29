// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IAlertMessages, AlertMessageErrorData } from "../common/IAlertMessages.js";
import { Action } from "../common/System.js";
import { LiteEvent } from "../common/LiteEvent.js";
import { ICommonPageViewModel } from "../serviceLoc/ICommonPageViewModel.js";
import { NotifyIconName, NotifyIcon, ErrorIcon, ConfirmIconName, ConfirmIcon, ErrorIconName, ErrorCode } from "../common/Enums.js";

   
export class AlertMessages implements IAlertMessages{

    private _confirmAction?: Action<boolean>;
    private _notificationTimeout: number = -1;

    public ShowErrorMessage = false;
    public ErrorMessage: string = "";
    public ErrorTitle: string = "";
    public ErrorIconClass: string = "";

    public ShowConfirmMessage = false;
    public ConfirmMessage: string = "";
    public ConfirmTitle: string = "";
    public ConfirmIconClass: string = "";
    public ConfirmYesOnly = false;

    public ShowNotification = false;
    public NotificationMessage: string = "";
    public NotificationIconClass : string = "";
    public YesText: string = "";
    public NoText: string = "";
    public ErrorOccurred = new LiteEvent<AlertMessageErrorData>();
    public CommonPageVM?: ICommonPageViewModel;

    constructor() {
    }

    private Log(messageType: string, message: string) {
        console.log(messageType, message);
    }

    public Notify(message: string, icon: NotifyIconName) {
        var thiss = this;

        if (icon === NotifyIcon.None)
            this.NotificationIconClass= "";
        else if (icon === NotifyIcon.OK)
            this.NotificationIconClass = ("fa fa-thumbs-up");
        else
            this.NotificationIconClass = ("fa fa-exclamation-triangle");

        thiss.Log("Notify", (icon != null ? icon.Name : "") + ":" + message);
        this.ShowNotification = true;
        this.NotificationMessage = (message);
        if (this._notificationTimeout > 0)
            clearTimeout(this._notificationTimeout);
        this._notificationTimeout = setTimeout(() => {
            thiss.ShowNotification = false;
            thiss._notificationTimeout = 0;
        }, 3000);
    }

    public ShowError(title: string, message: string, icon: ErrorIconName, confirmAction?: Action<boolean>, errorCode?: ErrorCode) {
        if (icon === ErrorIcon.None)
            this.NotificationIconClass = ("");
        else
            this.NotificationIconClass = ("fa fa-exclamation-triangle");

        this.ErrorMessage = (message);
        this.ErrorTitle = (title);
        this.ShowErrorMessage = true;
        var errorData = new AlertMessageErrorData();
        errorData.ErrorCode = errorCode;
        errorData.Icon = icon;
        errorData.Message = message;
        errorData.Title = title;
        this.ErrorOccurred.trigger(errorData);
        //var tracker = this.CommonPageVM.Resolve<Services.ITrackingService>(Services.ITrackingServiceName);
        //if (tracker != null)
        //    tracker.TrackEvent("ShowError", subId ?: string, data ?: string, type ?: Services.TrackType, sourceType ?: Services.TrackSourceType)
        this._confirmAction = confirmAction;
        var codeName = errorCode != null ? errorCode.Name : "";
        this.Log("ShowError" , codeName+":" + (icon != null ? icon.Name : "")  + ":" + title+":" +message);
    }

    public HideErrorMessage(clickDataContext: any, eventArgs: any) {
        this.ShowErrorMessage= false;
        if (this._confirmAction != null)
            this._confirmAction(false);
    }


    public Confirm(title: string, message: string, icon: ConfirmIconName, confirmAction?: Action<boolean>,yesText:string = "Yes" ,noText:string = "No"):boolean {
        if (confirmAction == null) {
            // use explorer confirm and lock the thread.
            return confirm(title + "\r\n" + "\r\n" + message);
        }
        this._confirmAction = confirmAction;
        this.ConfirmYesOnly= false;
        this.YesText = (yesText != null ? yesText:"Yes");
        this.NoText = (noText != null ? noText:"No");
        
        if (icon === ConfirmIcon.None)
            this.NotificationIconClass = ("");
        else if (icon === ConfirmIcon.Question)
            this.NotificationIconClass = ("fa fa-question");
        else if (icon === ConfirmIcon.OK) {
            this.NotificationIconClass = ("fa fa-check");
            this.ConfirmYesOnly = true;
            this.YesText = "Ok";
        } else
            this.NotificationIconClass = ("fa fa-exclamation-triangle");

        this.ConfirmMessage = (message);
        this.ConfirmTitle = (title);
        this.ShowConfirmMessage = true;
        this.Log("Confirm",  (icon != null ? icon.Name : "") + ":" + title + ":" + message);
        return true;
    }

    public ConfirmMessageOk(clickDataContext: any, eventArgs: any) {
        this.ShowConfirmMessage= false;
        if (this._confirmAction != null)
            this._confirmAction(true);
        return false;
    }

    public ConfirmMessageYes(clickDataContext:any,eventArgs:any) {
        this.ShowConfirmMessage= false;
        if (this._confirmAction != null)
            this._confirmAction(true);
        return false;
    }

    public ConfirmMessageNo(clickDataContext: any, eventArgs: any) {
        this.ShowConfirmMessage= false;
        if (this._confirmAction != null)
            this._confirmAction(false);
        return false;
    }

    public ConfirmMessageClose(clickDataContext: any, eventArgs: any) {
        this.ShowConfirmMessage= false;
        if (this._confirmAction != null)
            this._confirmAction(false);
        return false;
    }
}

