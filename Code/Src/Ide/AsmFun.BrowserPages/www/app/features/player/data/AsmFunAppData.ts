// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IAlertMessages } from '../../../common/IAlertMessages.js'
import { ICompilationData } from '../../editor/data/CompilationDatas.js'
import { IPopupWindowData } from '../../../framework/data/IPopupData.js'



export interface IAsmFunAppData {
    alertMessages: IAlertMessages,
    compilation: ICompilationData;
}

export interface IAsmFunIdeData extends IPopupWindowData {
    isVisible: boolean;
    isVisiblePopup: boolean;
    showDownloads: boolean;
    serverNotConnected: boolean;
    hasConfirmedLicense: boolean;
    isWindows: boolean;
    isMac: boolean;
    isLinux: boolean;
    newVersionAvailable: boolean;
    currentVersion: string;
    latestVersion: string;
    onDone: () => void,

    selectVarTab: (tab:string) => void,
    showZones: boolean,
    showMacros: boolean,
    showVariables: boolean,
    showMoreDownloads: boolean,
}




export enum BrowserTypes {
    Unknown,
    Windows,
    iOS,
    MacOS,
    Linux,
    Android
}