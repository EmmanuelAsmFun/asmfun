// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IBaseService } from './IBaseService.js'
import { Action2 } from '../../common/System.js'
import { IMediatorEvent, IMediatorSubscription } from './IMediator.js'

export interface IMediatorService extends IBaseService {

    /** Subscribes an actionName to a function to execute when the ActionName is Invoked . */
    Subscribe(actionName: string, action: Action2<any, IMediatorEvent>): IMediatorSubscription;

    /** Unsubscribes an actionName. */
    Unsubscribe(subscription: IMediatorSubscription);

    /** Fire an event by ActionName. */
    InvokeEvent(actionName: string, data: any);

}

