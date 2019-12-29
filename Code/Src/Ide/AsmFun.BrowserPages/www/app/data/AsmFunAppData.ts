// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IProcessorData, IProcessorExtraData, IMemoryData, IProgramData, IStackData, IInstructionItemData } from 'ProcessorData.js'
import { ISourceCodeBundle, ISourceCodeFile, ISourceCodeLabel, ISourceCodeLine, ISettings, IProjectManagerData } from 'ProjectData.js'
import { IAlertMessages } from '../common/IAlertMessages.js'
import { IErrorForStatusBar, IEditorBundle, IEditorLine, IEditorFile, IEditorLabel } from './EditorData.js'
import { IMemoryBlock, IMemoryViewerData } from './MemoryData.js'
import { IOpcodeData } from './IOpcodeData.js'
import { IEntertainer } from './EntertainerData.js'
import { ICodeAssistPopupData } from './ICodeAssistPopupData.js'
import { IAvatarData } from './AvatarData.js'
import { IComputerData } from './ComputerData.js'
import { ISpritesData } from './SpritesData.js'
import { ICompilationData } from './CompilationDatas.js'


export interface IAsmFunAppData {
    scfiles?: IEditorFile[];
    brain?: IProcessorExtraData;
    stack?: IStackData;
    data6502?: IProcessorData;
    dissasembly?: IProgramData;
    //previousSelectedPC?: IInstructionItemData;
    //previousSelectedLine?: IEditorLine;
    //sourceCode?: IEditorBundle;
    breakPoints?: string[];
    isShowDebugger: boolean;
    labelsWithoutZones?: IEditorLabel[];
    alertMessages: IAlertMessages,
    errorsForStatusBar: IErrorForStatusBar[];
    currentOpcode: IOpcodeData | null;
    codeAssistPopupData: ICodeAssistPopupData;
    selectedFile?: IEditorFile;
    settings: ISettings;
    avatar: IAvatarData; 
    projectManager: IProjectManagerData; 
    memoryViewer: IMemoryViewerData; 
    computer: IComputerData; 
    ide: IAsmFunIdeData;
    spritesManager: ISpritesData;
    compilation: ICompilationData;
}

export interface IAsmFunIdeData {
    isVisiblePlayerManager: boolean;
    isVisiblePopup: boolean;
    serverNotConnected: boolean;
    hasConfirmedLicense: boolean;
    isWindows: boolean;
    isMac: boolean;
    isLinux: boolean;
    newVersionAvailable: boolean;
    currentVersion: string;
    latestVersion: string;
}


export var NewProcessorData: IProcessorData = {
    programCounter: 0,
    registerA: 0,
    registerX: 0,
    registerY: 0,
    stackPointer: 0,
    statusRegister: 0
}
export var NewStackData: IStackData = {
    datas: [],
}
export var NewProcessorExtraData: IProcessorExtraData = {
    clockgoal6502: 0,
    clockticks6502: 0,
    ea: 0,
    oldpc: 0,
    oldstatus: 0,
    opcode: 0,
    penaltyAddr: 0,
    penaltyOp: 0,
    reladdr: 0,
    result: 0,
    value:0, 
}

export var NewProgramData: IProgramData = {
    language: "",
}


export enum BrowserTypes {
    Unknown,
    Windows,
    iOS,
    MacOS,
    Linux,
    Android
}