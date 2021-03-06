import { IUILabel } from "../../editor/data/ILabelsData.js";
import { IUIProperty } from "../../editor/data/IPropertiesData.js";
import { IUILine } from "../../editor/ui/IUILine.js";

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
    label?: IUILabel | IUIProperty;
    isSc: boolean; // is sourcecode
    isLabel : boolean;
    code:string;
    hilite:boolean;
    group:IMemoryBlockItem[];
    sourceCodeLine?:IUILine;
}

export interface IMemoryViewerData {
    HiliteSourceCode: boolean;
    isVisible: boolean;
    memoryBlock: IMemoryBlock;
    addressNames: IMemoryAddressInfo[];
    isMemoryEditing: boolean;
    memoryEditText: string;
    memoryEditKeyUp: (k) => void;
    memoryEditYOffset:number,
    showTOC: boolean;
    swapShowTOC: () => void;
    swapAutoReload: () => void;
    autoReload: boolean;
}
export interface IMemoryAddressInfo {
    startAddress: number;
    startAddressHex: string;
    endAddress: number;
    endAddressHex: string;
    name: string;
}