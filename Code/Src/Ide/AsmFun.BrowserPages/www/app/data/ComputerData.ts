// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

export interface IComputerData {
    isVisible: boolean;
    isDetailVisible: boolean;
}
export interface IKeyboardKey {
    key: string;
    which: number;
    ctrlKey: boolean;
    shiftKey: boolean;
    altKey: boolean;
}

export interface IMemoryDump {
    startAddress: number;
    endAddress: number;
    endAddressForUI: number;
    name: string;
    data: string;
}