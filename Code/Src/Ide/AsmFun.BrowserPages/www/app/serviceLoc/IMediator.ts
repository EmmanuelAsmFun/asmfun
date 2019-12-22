// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { Action2 } from '../common/System.js'

export interface IMediatorSubscription {
    /** The action to execute. */
    Action: Action2<any, IMediatorEvent>;
    /** The actionName. */
    ActionName: string;
    /** If this subscription is deleted. */
    IsDeleted: boolean;

    /** Delete this subsciption. */
    Delete();
}

export interface IMediatorEvent {
    ContinuePropagation: boolean;
}

