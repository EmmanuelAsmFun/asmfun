// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { ISourceCodeBundle, ISourceCodeFile, ISourceCodeLine, ISourceCodeLabel } from "../../project/data/ProjectData.js";
import { IOpcodeData } from "./IOpcodeData.js";
import { EditorManager } from "../EditorManager.js";


export class EditorData {
    public cursorX: number = 0;
    public cursorY: number = 0;
    public cursorWishedX: number = 0;
    public maxX: number = 0;
    public maxY: number = 0;
    public charWidth: number = 7.8; // 9.65 for line-height 20px;
    public charHeight: number = 18;
    public screenXOffset: number = -4;
    public screenYOffset: number = -1;
}
export interface ILineHtml {
    root?: HTMLElement;
    lineNumber?: HTMLElement;
    code: HTMLElement;
    codeParent?: HTMLElement;
    asmFunCode?: HTMLElement;
    valueElement?: HTMLElement;
    address?: HTMLElement;
    breakpoint?: HTMLElement;
}
export interface ICodeBlockContext{
    isFor: boolean;
    parameters?: string[];
    isAddr: boolean;
    isIf: boolean;
    isElse: boolean;
    parent? :ICodeBlockContext;
    file: IEditorFile;
    children: ICodeBlockContext[];
    lines: IEditorLine[];
    isMacro: boolean;
    name: string;
    nameDirty?: string;
    isFile: boolean;
    isRoot: boolean;
    bundle: IEditorBundle;

    CreateChild(file?:IEditorFile): ICodeBlockContext;
    Remove(context: ICodeBlockContext);
    CreateZone(line: IEditorLine, name: string, isLocalZone:boolean): ICodeBlockContext;
    CreateIfCodeBlock(line: IEditorLine, compareData: string): ICodeBlockContext;
    CreateElseCodeBlock(line: IEditorLine): ICodeBlockContext;
    CreateAddrCodeBlock(line: IEditorLine, compareData: string): ICodeBlockContext;
    CreateCodeBlock(line: IEditorLine, name: string): ICodeBlockContext;
    CloseCurrentBlock(line: IEditorLine): ICodeBlockContext;
    CreateMacro(line: IEditorLine, name: string, parameters: string[]): ICodeBlockContext;
    CreateForBlock(line: IEditorLine, parameters: string[]): ICodeBlockContext;
    AddPotentialReference(line: IEditorLine, referenceName: string);
    AddLine(editorLine: IEditorLine);
    RemoveLine(line : IEditorLine);
    ParseLinksBetweenLines();
    AddSetter(line: IEditorLine, property: IPropertyData);
    AddAddressSetter(line: IEditorLine, name:string, address:number);
}
export interface IEditorZone {
    line: IEditorLine;
    name: string;
    nameDirty: string;
    isAnonymousZone: boolean;
    isLocalZone: boolean;
}

export interface ILineError {
    line: IEditorLine;
    message: string,
    compilerName: string,
    isFromCompiler:boolean,
}
export interface IErrorForStatusBar {
    className: string;
    posY: number;
    lineNumber: number;
}

export interface IEditorBundle {
    labels: IEditorLabel[];
    files: IEditorFile[];
    allContext: ICodeBlockContext[];
    data: ISourceCodeBundle;
}

export interface IEditorLabel {
    property?: IPropertyData | null;
    line: IEditorLine;
    hilite: boolean;
    isZone: boolean;
    isVariable: boolean;
    data: ISourceCodeLabel;
    isInEditMode: boolean | null;
    newValue: string | null;
    showValueInCode: boolean;
    addressHexValue: string;
    labelhexValue: string;
    labelhexAddress: string;
    file: IEditorFile;
    lines: IEditorLine[],
}
export interface IEditorFile {
    fileHtml: HTMLElement | null;
    lines: IEditorLine[]
    data: ISourceCodeFile;
    isSelected: boolean;
    lastCursorY: number;
    lastCursorX: number;
    
}
export interface IEditorLine {
    canSetBreakPoint: boolean;
    
    zone: IEditorZone | null;
    isVariable: boolean;
    linkToLocalVariable?: string | null;
    macroSource?: ICodeBlockContext | null;
    file: IEditorFile;
    data: ISourceCodeLine;
    context: ICodeBlockContext;
    rawContent: string;
    byteValues: string;
    comment: string;
    preCode: string;
    hilite: boolean;
    dataCode: string;
    indent: string;
    indentAfterZone: string;
    selected: boolean;
    
    sourceCodeHtml: string;
    //codeHtml: ILineHtml | null;
    
    hasBreakPoint: boolean;
    isDataTransfer: boolean;
    isSetRawData: boolean;
    isFixValue: boolean;
    isReturn: boolean;
    isJump: boolean;
    isCompare: boolean;
    isCompilerData: boolean;
   
    // setter
    isAddressSetter: boolean;
    property? : IPropertyData | null;

    // labels & zone
    isZone: boolean;
    label?: IEditorLabel | null;
    labelZoneSource?: IEditorLabel | null;
    labelVariableSource?: IEditorLabel | null;
    linkToZone: boolean;
    linkToVar: boolean;
    potentialLabel: string;
    labelHexValue: string;
    
    // macro
    macro?: ICodeBlockContext | null;
    isMacro: boolean;
    linkToMacro: boolean;
    potentialMacro: string;

    // opcode
    opcode: IOpcodeData | null;
    asmFunCode: string | null;
    // error
    hasError: boolean;
    error?: ILineError | null;

    isEndOfBlock: boolean;
}
export enum PropertyNumType {
    Unknown = 0,
    Byte = 1,
    Int16 = 2,
    Int24 = 3,
    Int32 = 4
}
export interface IPropertyData {
    dataLength: number,
    dataNumType: PropertyNumType,
    dataType: string,
    defaultNumValue: number,
    isBigEndian: boolean,
    name: string,
    nameDirty: string,
}
export function ResetLineProperties(line: IEditorLine) {
    if (line == null) return;
    line.dataCode = "";
    line.comment = "";
    line.preCode = "";
    line.isDataTransfer = false;
    line.isCompare = false;
    line.isJump = false;
    line.isReturn = false;
    line.isFixValue = false;
    line.isCompilerData = false;
    // editor
    line.hilite = false;

    // setter
    line.isSetRawData = false;
    line.isAddressSetter = false;
    line.isVariable = false;
    line.property = null;
   
    // line.byteValues = 0;
    // label / zone
    line.labelHexValue = "";
    line.labelZoneSource = null;
    line.label = null;
    line.isZone = false;
    line.linkToZone = false;
    line.linkToVar = false;
    line.potentialLabel = "";
    line.linkToLocalVariable = null;

    // macro
    line.isMacro = false;
    line.macro = null;
    line.linkToMacro = false;
    line.potentialMacro = "";
    line.macroSource = null;
    // opcode
    line.opcode = null;
    line.asmFunCode = null;
    // error
    line.hasError = false;
    line.error = null;
}


export function CreateNewEditorLine(context: ICodeBlockContext, line: ISourceCodeLine, editorFile: IEditorFile): IEditorLine  {
    return {
        preCode: "",
        dataCode: "",
        comment: "",
        asmFunCode: "",
        sourceCodeHtml: "",
        labelHexValue: "",
        opcode: null,
        selected: false,
        byteValues: "",
        isDataTransfer: false,
        isCompare: false,
        isJump: false,
        isReturn: false,
        isMacro: false,
        hasBreakPoint: false,
        isFixValue: false,
        isCompilerData: false,
        // setter
        isSetRawData: false,
        isAddressSetter: false,
        isVariable: false,
        isZone: false,
        rawContent: "",
        linkToVar: false,
        hasError: false,
        label: null,
        indent: "",
        indentAfterZone: "",
        data: line,
        context: context,
        potentialLabel: "",
        potentialMacro: "",
        linkToMacro: false,
        linkToZone: false,
        hilite: false,
        file: editorFile,
        zone: null,
        isEndOfBlock: false,
        canSetBreakPoint: false,
        // codeHtml: null,
    };
};

export function CreateNewFile(file: ISourceCodeFile): IEditorFile {
    return {
        data: file,
        isSelected: false,
        lastCursorX:0,
        lastCursorY:0,
        lines: [],
        fileHtml: null,
    };
}
export function CreateNewBundle(bundle: ISourceCodeBundle): IEditorBundle {
    return {
        data: bundle,
        labels: [],
        files: [],
        allContext: [],
    };
}
export function CreateNewEditorLabel(label: ISourceCodeLabel, file: IEditorFile, line: IEditorLine): IEditorLabel {
    return {
        data: label,
        isInEditMode: false,
        newValue: "",
        showValueInCode: false,
        isZone: false,
        addressHexValue: "",
        labelhexAddress: "",
        labelhexValue: "",
        isVariable: false,
        hilite: false,
        file: file,
        line: line,
        lines: [],
    };
}

export interface IEditorSelection {
    reversed: boolean;
    startLine: number;
    endLine: number;
    startOffset: number;
    endOffset: number;
    startText: string;
    endText: string;
}
export interface IUndoData {
    toInsertChars: string;
    lineText: string;
    isChars: boolean;
    isDeleteKey: boolean;
    isBackspaceLine: boolean;
    isSameLine: boolean;
    isMultiLine: boolean;
    isEnter: boolean;
    addonLines: string[];
    x: number;
    y: number;
}

export function NewEmptyFile(): IEditorFile {
    return {
        isSelected: false,
        lastCursorX: 0,
        lastCursorY: 0,
        lines: [],
        data: {
            isBinary: false,
            isCodeFile: false,
            folder: "",
            fileName: "",
            fileNameFull: "",
            exists: false,
            lines: [],
            requireSave: false,
        },
        fileHtml: null
    }
}

export interface IEditorManagerData {
    scfiles?: IEditorFile[];
    //previousSelectedPC?: IInstructionItemData;
    //previousSelectedLine?: IEditorLine;
    //sourceCode?: IEditorBundle;
    breakPoints: string[];
    showASMFunCode: boolean;
    variables: IEditorLabel[];
    labels: IEditorLabel[];
    zones: IEditorZone[];
    macros: ICodeBlockContext[];
    errorsForStatusBar: IErrorForStatusBar[];
    currentOpcode: IOpcodeData | null;
    //codeAssistPopupData: ICodeAssistPopupData;
    selectedFile?: IEditorFile;
}
export var NewEditorManagerData: IEditorManagerData = {
    
    scfiles: [],
    labels: [],
    variables: [],
    macros: [],
    zones: [],
    breakPoints: [],
    errorsForStatusBar: [],
    showASMFunCode: true,
    currentOpcode: { code: '', asmFunCode: '', },
    selectedFile: NewEmptyFile(),
};