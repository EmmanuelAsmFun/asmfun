// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IOpcodeData } from './IOpcodeData.js'
import { IUILabel } from './ILabelsData.js'
import { IUIMacro } from './IMacrosData.js'
import { IUIProperty } from './IPropertiesData.js'

export interface ICodeAssistPopupDataItem {
    IsSelected: boolean;
    Data: IOpcodeData | IUILabel | IUIMacro | IUIProperty;
    Name: string;
    Hint: string;
    Select: (s:ICodeAssistPopupDataItem) => void;
    Index: number;
    IsMacro: boolean,
    IsLabel: boolean,
    IsProperty: boolean,
}
export interface ICodeAssistPopupData {
    Items: ICodeAssistPopupDataItem[];
    Selected?: ICodeAssistPopupDataItem | null;
    IsVisible: boolean;
    PosX: string;
    PosY: string;
    SelectedIndex: number;
}

export interface ICodeAssistable {

}