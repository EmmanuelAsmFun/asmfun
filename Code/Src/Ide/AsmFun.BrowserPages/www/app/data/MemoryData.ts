// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IEditorLine, IEditorLabel } from "./EditorData";

export interface IMemoryBlock {
    currentPage: number;
    totalPages: number;
    startAddress: number;
    startAddressHex: string;
    endAddressHex: string;
    count: number;
    /** Base64 encoded data */
    data: string; 
    datas: IMemoryBlockItem[];
}

export interface IMemoryBlockItem {
    isVariable: boolean;
    isZone: boolean;
    isStart: boolean;
    label?:IEditorLabel;
    isSc: boolean; // is sourcecode
    isLabel : boolean;
    code:string;
    hilite:boolean;
    group:IMemoryBlockItem[];
    sourceCodeLine?:IEditorLine;
}

export interface IMemoryViewerData {
    isVisible: boolean;
    memoryBlock: IMemoryBlock;
}
