﻿// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { ArrayEx } from "../common/TsFixes.js";
import { IOpcodeData } from "./IOpcodeData.js";
import { IEditorLine } from "./EditorData.js";

export var CompilerNames: { name: string, value: number, webAddress: string }[] = [
    { value: 1, name: "ACME", webAddress:"https://sourceforge.net/projects/acme-crossass/" },
    //{ value: 2, name: "VASM  not implemented yet", webAddress: "http://sun.hasenbraten.de/vasm/index.php?view=relsrc" },
    //{ value: 3, name: "DASM not implemented yet", webAddress: "https://sourceforge.net/projects/dasm-dillon/" },
    { value: 4, name: "Cc65  not implemented yet", webAddress: "https://www.cc65.org/index.php#Download" }
];
export var RomVersionNames: { name: string, value: string }[] = [
    { value: "R33", name: "Michael Steil's ROM R33" },
    { value: "R34", name: "Michael Steil's ROM R34 (Under construction)" }];

export interface ISourceCodeBundle {
    sourceFileName: string;
    name: string;
    files?: ArrayEx<ISourceCodeFile> | ISourceCodeFile[];
    labels?: ArrayEx<ISourceCodeLabel> | ISourceCodeLabel[];
    
}


export interface ISourceCodeFile {
   
    folder: string;
    fileNameFull: string;
    fileName: string;
    isCodeFile: boolean;
    isBinary: boolean;
    exists: boolean;
    lines?: ArrayEx<ISourceCodeLine> | ISourceCodeLine[];
}

export interface ISourceCodeLabel {
    variableLength: number;
    address: number;
    name: string;
    value: number;
    
}


export interface ISourceCodeLine {
    resultMemoryAddress: string
    sourceCode: string;
    lineNumber: number;
}

export enum ProjectCompilerTypes {
    Unknown = 0,
    ACME = 1,
    VASM = 2,
    DASM = 3,
    Cc65 = 4,
}
export enum ProjectComputerTypes {
    Unknown = 0,
    CommanderX16 = 1
}
export enum ComputerRunMode {
    Unknown,
    Internal,
    External
}


export interface IUserSettings {
    lastOpenedProjectFileName: string;
    computerSettings: IComputerSettings;
    ideSettings: IIdeSettings;
    platform: string;
    projectsFolder: string;
    localProjects: IProjectDetail[],
}

export interface IComputerSettings {
    x16ComputerFolder: string;
    runMode: ComputerRunMode;
    computerType: string;
}

export interface IIdeSettings {
    lastProjectFolder: string;
    lastProjectMainFile: string;
    acme: IACMECompilerSettings;
    vasm: IVASMCompilerSettings;
    dasm: IDASMCompilerSettings;
    cc65: ICc65CompilerSettings;
}

export interface IACMECompilerSettings {
    acmeFileName: string;
}
export interface IVASMCompilerSettings {
    vasmFolder: string;
}
export interface IDASMCompilerSettings {
    dasmFolder: string;
}
export interface ICc65CompilerSettings {
    cc65Folder: string;
}
export interface ISettings {
    userSettings?: IUserSettings | null;
    projectSettings?: IProjectSettings | null;
    isVisible: boolean;
    configuration?: IBuildConfiguration | null;
    saveProjectSettings: () => void;
    saveUserSettings: () => void;
    serverAddressWithPort: string;
}

export interface IProjectSettings {
    sourceCodeFolder: string;
    configurations: IBuildConfiguration[];
    selectedConfiguration: number;
    detail: IProjectDetail;
    programFileName: string;
    startupFile: string;
}

export interface IProjectManagerData {
    settings?: IProjectSettings;
    isVisible: boolean;
    isNewProject: boolean;
    projectsFolder: string;
    localProjects: IProjectDetail[],
    webProjects: IProjectDetail[],
    newBuildConfiguration: IBuildConfiguration,
    newProjectFileName: string;
    newProjectCompiler: number;
    newProjectRomVersion: string;
    newProjectDeveloperName: string;
    showOpenFileFolder: boolean;
    openFileFolder: string;
    folderChar: string;
    projectIsDownloading: boolean;
    compilerNames: { name: string, value: number, webAddress:string}[];
    romVersionNames: { name: string, value: string }[];
}
export interface IBuildConfiguration {
    addonCommandLine: string;
    programFileName: string;
    compilerVariables: string;
    compilerType: ProjectCompilerTypes;
    computerType: ProjectComputerTypes;
    outputFolderName: string;
    romVersion: string;
}
export enum InternetSourceType {
    Unknown = 0,
    ZipUrl = 1,
    GitHub = 2,
    Bitbucket = 3,
}
export interface IProjectDetail {
    id: string;
    name: string;
    developerName: string;
    devPicUrl: string;
    projectUrl: string;
    imageUrl?: string;
    internetSource?: string;
    internetSourceType: InternetSourceType;
    description: string;
    underConstruction: boolean;
}