import { IEditorLine, IEditorFile } from "../../editor/data/EditorData";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

export interface IDebuggerBreakpoint {
    address: number;
    index: number;
    isEnabled: boolean;
}

export interface IBreakPointsManagerData {
    isVisible: boolean,
    list: IBreakpointUIData[],
    newBreakpointAddress: string,
    isAddingBreakpointAddress: boolean,
    swapAddBreakPoint:(state:boolean) => void,
    addBreakPoint:() => void,
}
export function NewBreakPointsManagerData(): IBreakPointsManagerData {
    return {
        isVisible: false,
        newBreakpointAddress: "",
        isAddingBreakpointAddress: false,
        swapAddBreakPoint: () => {},
        addBreakPoint: () => {},
        list : [],
    };
}

export interface IBreakpointUIData {
    IsEnabled: boolean,
    Index: number,
    LineNumber: number,
    Address: number,
    AddressHex: string,
    LineText: string,
    File: IEditorFile | null,
    Line: IEditorLine | null,
}

export var UIDataNameBreakPoints = "breakpoints"