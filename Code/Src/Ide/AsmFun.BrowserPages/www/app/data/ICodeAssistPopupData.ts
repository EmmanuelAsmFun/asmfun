// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { ISourceCodeLabel} from './ProjectData.js'
import { Action0, Action } from '../common/System.js'
import { IEditorLabel, ICodeBlockContext } from './EditorData.js'
import { IOpcodeData } from './IOpcodeData.js'

export interface ICodeAssistPopupDataItem {
    isSelected: boolean;
    data: IEditorLabel | ICodeBlockContext | IOpcodeData;
    name: string;
    hint: string;
    select: Action<ICodeAssistPopupDataItem>;
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

