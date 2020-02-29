// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { ISourceCodeBundle, ISourceCodeFile, ISourceCodeLine } from "../../project/data/ProjectData.js";
import { IOpcodeData } from "./IOpcodeData.js";
import { IUIInterpreterBundleData, NewUIInterpreterBundleData } from "./InterpreterData.js";
import { IUILine, NewUiLine } from "../ui/IUILine.js";
import { IUIFile, NewUIFile } from "../ui/IUIFile.js";


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

export interface ILineError {
    line: IUILine;
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
    files: IEditorFile[];
    //allContext: ICodeBlockContext[];
    data: ISourceCodeBundle;
}

export interface IEditorFile {
    Index: number;
    lines: IEditorLine[]
    data: ISourceCodeFile;
    lastCursorY: number;
    lastCursorX: number;
    Ui: IUIFile;
}
export interface IEditorLine {
    Ui: IUILine;
    file: IEditorFile;
    data: ISourceCodeLine;
    dataCode: string;
    isReturn: boolean;
    isJump: boolean;
    isCompare: boolean;
    opcode: IOpcodeData | null;
    isEndOfBlock: boolean;
}
export enum PropertyNumType {
    Unknown = 0,
    Byte = 1,
    Int16 = 2,
    Int24 = 3,
    Int32 = 4
}
export interface IPropertyType {
    isNumericLight: boolean; // if its a simple type that can easely be parsed
    dataString: string;
    dataItemLength: number,
    dataLength: number,
    dataNumType: PropertyNumType,
    dataType: string,
    defaultNumValue: number,
    isBigEndian: boolean,
}
export function ResetLineProperties(line: IEditorLine) {
    if (line == null) return;
    line.dataCode = "";
    line.isCompare = false;
    line.isJump = false;
    line.isReturn = false;
    line.opcode = null;
    line.isEndOfBlock = false;
}


export function CreateNewEditorLine(line: ISourceCodeLine, editorFile: IEditorFile): IEditorLine  {
    return {
        dataCode: "",
        opcode: null,
        isCompare: false,
        isJump: false,
        isReturn: false,
        data: line,
        file: editorFile,
        isEndOfBlock: false,
        Ui: NewUiLine()
        // codeHtml: null,
    };
};

export function CreateNewFile(file: ISourceCodeFile): IEditorFile {
    return {
        data: file,
        lastCursorX:0,
        lastCursorY:0,
        lines: [],
        Index: 0,
        Ui: {
            Exists: file.exists,
            FileName: file.fileName,
            Folder: file.folder,
            Index: 0,
            IsBinary: file.isBinary,
            IsCodeFile: file.isCodeFile,
            IsIncludeFile: file.isIncludeFile,
            IsSelected: false,
            RequireSave: false,
        }
    };
}
export function CreateNewEditorBundle(bundle: ISourceCodeBundle): IEditorBundle {
    return {
        data: bundle,
        files: [],
        //allContext: [],
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
    afterUndoX:number,
}

export function NewEmptyFile(): IEditorFile {
    return {
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
            isIncludeFile:false,
        },
        Index: 0,
        Ui: NewUIFile(),
    }
}

export interface IEditorManagerData{
    Files: IUIFile[] | null;
    breakPoints: string[];
    showASMFunCode: boolean;
    errorsForStatusBar: IErrorForStatusBar[];
    currentOpcode: IOpcodeData | null;
    SelectedFile: IUIFile | null;
    isTextEditorInFocus: boolean;
    Bundle: IUIInterpreterBundleData;
}
export var NewEditorManagerData: IEditorManagerData = {
    Files: [],
    breakPoints: [],
    errorsForStatusBar: [],
    showASMFunCode: true,
    currentOpcode: { code: '', asmFunCode: '', },
    SelectedFile: NewUIFile(),
    isTextEditorInFocus: false,
    Bundle: NewUIInterpreterBundleData(),
};