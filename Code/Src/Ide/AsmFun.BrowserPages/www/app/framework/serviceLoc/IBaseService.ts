// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { ServiceName } from './ServiceName.js'
import { ICommonPageViewModel } from './ICommonPageViewModel.js'

export interface IServiceResolver {
    /** Gets a service by his interface name . */
    Resolve<T extends IBaseService>(serviceName: ServiceName): T;
}

/** The public base service interface. */
export interface IBaseService {
}

export interface IBaseServiceInternal extends IBaseService {
    _isInitialized: boolean;
    Init(commonPageVM: ICommonPageViewModel);
    Dispose();
}


