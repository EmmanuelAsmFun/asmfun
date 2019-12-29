// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { Action2 } from '../common/System.js'
import { IBaseCommand, ICommandType } from '../data/commands/CommandsCommon.js';

export interface ICommandManager {
    /** Subscribes to a command. Pass an empty command as the first parameter with the namespace and commandname filled. */
    Subscribe2<T extends IBaseCommand>(command: T, callerObj:object, action: Action2<T, ICommandEvent>): ICommandSubscription;
    Subscribe2At<T extends IBaseCommand>(index: number,command: T, callerObj:object, action: Action2<T, ICommandEvent>): ICommandSubscription;
    Subscribe<T extends IBaseCommand>(commandType: ICommandType, callerObj:object, action: Action2<T, ICommandEvent>): ICommandSubscription;
    SubscribeAt<T extends IBaseCommand>(index:number, commandType: ICommandType, callerObj:object, action: Action2<T, ICommandEvent>): ICommandSubscription;

    /** Subscribes to a command. */
    SubscribeByName<T extends IBaseCommand>(nameSpace: string, commandName: string, callerObj: object, action: Action2<T, ICommandEvent>): ICommandSubscription;

    /** Unsubscribes an nameSpace. */
    Unsubscribe(subscription: ICommandSubscription);

    /** Fire an event by nameSpace. */
    InvokeCommand(command: IBaseCommand);

    /** Disposes this instance with all the subscriptions. */
    Dispose();
}

export interface ICommandSubscription {

    getFullName(): string;

    /** If this subscription is deleted. */
    IsDeleted: boolean;

    /** Delete this subsciption. */
    Dispose();
}

export interface ICommandEvent {
    ContinuePropagation: boolean;
}

