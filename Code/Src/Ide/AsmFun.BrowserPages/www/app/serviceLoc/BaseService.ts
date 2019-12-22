// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { IBaseServiceInternal, IBaseService } from './IBaseService.js'
import { Action2, Action } from '../common/System.js'
import { IMediatorEvent, IMediatorSubscription } from './IMediator.js'
import { ServiceName } from './ServiceName.js'
import { ICommonPageViewModel } from './ICommonPageViewModel.js'
import { IDisposable } from '../common/System.js'
import { ErrorIconName, ErrorIcon, NotifyIconName, ConfirmIconName} from '../common/Enums.js'


    /** Base class for creating services. */
export class BaseService implements IBaseServiceInternal, IDisposable {

    public _isInitialized: boolean = false;

    /** The commanPage content ViewModel. */
    public CommonPageVM: ICommonPageViewModel;

    constructor() {
        //super();
    }

    /** Invoked by the ServiceManager. */
    public Init(commonPageVM: ICommonPageViewModel) {
        this.CommonPageVM = commonPageVM;
        this.OnInit();
        this._isInitialized = true;
    }

    /** (override) Initialize in overrideing class. */
    protected OnInit() {
    }

    /** Disposes this service.*/
    public Dispose() {

        this.OnDispose();
    }

    /** (override) When this service is disposing. */
    protected OnDispose() {
    }

    /** Ask for a confirmation. */
    public Confirm(title: string, message: string, icon: ConfirmIconName, confirmAction: Action<boolean>, yesText?: string, noText?: string): boolean {
        return this.CommonPageVM.AlertMessage.Confirm(title, message, icon, confirmAction, yesText, noText);
    }

    /** Displays a notification message. */
    public Notify(message: string, icon: NotifyIconName) {
        this.CommonPageVM.AlertMessage.Notify(message, icon);
    }

    /** Displays an error. */
    public ShowError(title: string, message: string, icon: ErrorIconName = ErrorIcon.Exclamation, confirmAction?: Action<boolean>) {
        this.CommonPageVM.AlertMessage.ShowError(title, message, icon, confirmAction);
    }

    /** Sends an event to all the subscribed objects. */
    public InvokeEvent(eventActionName: string, data: any) {
        this.CommonPageVM.InvokeEvent(eventActionName, data);
    }

    /** Subscribes for a specific event. */
    public SubscribeEvent(eventActionName: string, method: Action2<any, IMediatorEvent>): IMediatorSubscription {
        return this.CommonPageVM.SubscribeEvent(eventActionName, method);
    }

    /** Unsubscribes for a specific event. */
    public UnsubscribeEvent(subscription: IMediatorSubscription) {
        this.CommonPageVM.UnsubscribeEvent(subscription);
    }

    /** (override) Gets the name of this service. */
    public GetName(): string {
        return this.OnGetName().Name;
    }

    /** (override) Gets the name of this service. */
    protected OnGetName(): ServiceName {
        throw "override OnGetName in your service.";
    }

    /** Gets a service by his interface name . */
    public Resolve<T extends IBaseService>(serviceName: ServiceName): T {
        return this.CommonPageVM.Resolve<T>(serviceName);
    }

}

