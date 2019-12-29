// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
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

