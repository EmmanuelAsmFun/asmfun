import { IEditorLine, IEditorLabel } from "../../editor/data/EditorData";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion


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
    addressNames: IMemoryAddressInfo[];
    isMemoryEditing: boolean;
    memoryEditText: string;
    memoryEditKeyUp: (k) => void;
    memoryEditYOffset:number,
    showTOC: boolean;
    swapShowTOC: () => void;
}
export interface IMemoryAddressInfo {
    startAddress: number;
    startAddressHex: string;
    endAddress: number;
    endAddressHex: string;
    name: string;
}