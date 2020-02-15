// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IEditorLabel, ICodeBlockContext } from './EditorData.js'
import { IOpcodeData } from './IOpcodeData.js'

export interface ICodeAssistPopupDataItem {
    isSelected: boolean;
    data: IEditorLabel | ICodeBlockContext | IOpcodeData;
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

