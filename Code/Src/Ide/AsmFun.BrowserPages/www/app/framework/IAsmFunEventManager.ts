// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { Action2 } from '../common/System.js'
import { IAsmFunBaseEvent, IAsmFunEventType } from './data/EventsCommon.js';

export interface IEventManager {
    /** Subscribes to a event. Pass an empty event as the first parameter with the namespace and eventname filled. */
    Subscribe2<T extends IAsmFunBaseEvent>(event: T, callerObj: object, action: Action2<T, IAsmFunEventEvent>): IAsmFunEventSubscription;
    Subscribe2At<T extends IAsmFunBaseEvent>(index: number, event: T, callerObj: object, action: Action2<T, IAsmFunEventEvent>): IAsmFunEventSubscription;
    Subscribe<T extends IAsmFunBaseEvent>(eventType: IAsmFunEventType, callerObj: object, action: Action2<T, IAsmFunEventEvent>): IAsmFunEventSubscription;
    SubscribeAt<T extends IAsmFunBaseEvent>(index: number, eventType: IAsmFunEventType, callerObj: object, action: Action2<T, IAsmFunEventEvent>): IAsmFunEventSubscription;

    /** Subscribes to a event. */
    SubscribeByName<T extends IAsmFunBaseEvent>(nameSpace: string, eventName: string, callerObj: object, action: Action2<T, IAsmFunEventEvent>): IAsmFunEventSubscription;

    /** Unsubscribes an nameSpace. */
    Unsubscribe(subscription: IAsmFunEventSubscription);

    /** Fire an event by nameSpace. */
    InvokeEvent(event: IAsmFunBaseEvent);

    /** Disposes this instance with all the subscriptions. */
    Dispose();
}

export interface IAsmFunEventSubscription {

    getFullName(): string;

    /** If this subscription is deleted. */
    IsDeleted: boolean;

    /** Delete this subsciption. */
    Dispose();
}

export interface IAsmFunEventEvent {
    ContinuePropagation: boolean;
}

