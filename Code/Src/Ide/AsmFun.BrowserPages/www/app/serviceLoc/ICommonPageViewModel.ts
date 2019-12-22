// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { IServiceResolver } from "./IBaseService.js";
import { Action2 } from "../common/System.js";
import { IAlertMessages } from "../common/IAlertMessages";
import { IMediatorEvent, IMediatorSubscription } from "./IMediator.js";
import { IServiceResolverFactory } from "./IServiceResolver.js";

export interface ICommonPageViewModel extends IServiceResolver {

    /** The class with all the alert messages */
    AlertMessage: IAlertMessages;

    /** Sends an event to all the subscribed objects. */
    InvokeEvent(eventActionName: string, data: any);
    /** Subscribes for a specific event. */
    SubscribeEvent(eventActionName: string, method: Action2<any, IMediatorEvent>): IMediatorSubscription;
    /** Unsubscribes for a specific event. */
    UnsubscribeEvent(subscription: IMediatorSubscription);
    /** The serviceResolver . */
    ServiceResolver: IServiceResolverFactory;

    /** Initializes the ViewModel */
    Init();
}

