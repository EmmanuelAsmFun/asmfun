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
    isSelected: boolean;
    data: IOpcodeData | IUILabel | IUIMacro | IUIProperty;
    name: string;
    hint: string;
    select: (s:ICodeAssistPopupDataItem) => void;
    index: number;
}
export interface ICodeAssistPopupData {
    items: ICodeAssistPopupDataItem[];
    selected?: ICodeAssistPopupDataItem | null;
    isVisible: boolean;
    posX: string;
    posY: string;
    selectedIndex: number;
}

