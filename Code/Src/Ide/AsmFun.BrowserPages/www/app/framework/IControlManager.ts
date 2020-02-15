// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IUIControl } from './IUIControl.js';

export interface IControlManager {
   
    Activate(control: IUIControl);
    Subscribe(control: IUIControl);
    Unsubscribe(control: IUIControl);

    /** Disposes this instance with all the subscriptions. */
    Dispose();
}
