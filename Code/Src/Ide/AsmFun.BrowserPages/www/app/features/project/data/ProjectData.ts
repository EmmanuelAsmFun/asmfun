import { ArrayEx } from "../../../common/TsFixes.js";
import { IPopupWindowData } from "../../../framework/data/IPopupData.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion


export var CompilerNames: { name: string, value: number, webAddress: string }[] = [
    { value: 1, name: "ACME", webAddress:"https://sourceforge.net/projects/acme-crossass/" },
    //{ value: 2, name: "VASM  not implemented yet", webAddress: "http://sun.hasenbraten.de/vasm/index.php?view=relsrc" },
    //{ value: 3, name: "DASM not implemented yet", webAddress: "https://sourceforge.net/projects/dasm-dillon/" },
    { value: 4, name: "Cc65 Under construction", webAddress: "https://www.cc65.org/index.php#Download" }
];
export var RomVersionNames: { name: string, value: string }[] = [
    { value: "R33", name: "ROM R33" },
    { value: "R34", name: "ROM R34" },
    { value: "R35", name: "ROM R35" },
    { value: "R36", name: "ROM R36" },
    { value: "R37", name: "ROM R37" },
];

export interface ISourceCodeBundle {
    sourceFileName: string;
    name: string;
    files?: ArrayEx<ISourceCodeFile> | ISourceCodeFile[];
    labels?: ArrayEx<ISourceCodeLabel> | ISourceCodeLabel[];
}
export interface IAddressDataBundle {
    sourceFileName: string;
    name: string;
    files: IAddressDataFile[];
    labels: IAddressDataLabel[];
}
export interface IAddressDataFile {
    folder: string;
    fileName: string;
    lines: IAddressDataLine[];
}
export interface IAddressDataLine {
    line: number;
    address: string;
}
export interface IAddressDataLabel {
    address: number;
    name: string;
    value: number;
    length:number
}
export interface IAddressDataLabelResponse {
    address: number;
    name: string;
    value: number;
    values: string | null;// Base64 string
    length: number
}


export interface ISourceCodeFile {
    requireSave: boolean;
    folder: string;
    fileNameFull: string;
    fileName: string;
    isCodeFile: boolean;
    isIncludeFile: boolean;
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
    serverVersion: string;
    projectsFolder: string;
    localProjects: IProjectDetail[],
}

export interface IComputerSettings {
    x16ComputerFolder: string;
    soundEnabled: boolean;
    runMode: ComputerRunMode;
    computerType: string;
    keyMapIndex: number;
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
    vasmFileName: string;
}
export interface IDASMCompilerSettings {
    dasmFileName: string;
}
export interface ICc65CompilerSettings {
    cc65FileName: string;
}
export interface ISettings extends IPopupWindowData{
    keyMapChanged: () => void;
    selectedKeyMap: string;
    userSettings?: IUserSettings | null;
    projectSettings?: IProjectSettings | null;
    isVisible: boolean;
    isVisiblePopup: boolean;
    configuration?: IBuildConfiguration | null;
    saveProjectSettings: () => void;
    saveUserSettings: () => void;
    serverAddressWithPort: string;
    keyMaps: string[],
}

export interface IProjectSettings {
    isProgramOnly: boolean;
    folder: string;
    sourceCodeFolder: string;
    configurations: IBuildConfiguration[];
    selectedConfiguration: number;
    detail: IProjectDetail;
    programFileName: string;
    startupFile: string;
}

export interface IProjectManagerData extends IPopupWindowData{
    settings?: IProjectSettings;
    isVisible: boolean;
    isVisiblePopup: boolean;
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
 export function NewProjectManagerData(): IProjectManagerData {
    return {
        isNewProject: false,
        isVisible: false,
        isVisiblePopup: false,
        projectsFolder: "",
        localProjects: [],
        webProjects: [],
        newProjectFileName: "",
        newBuildConfiguration: NewBuildConfiguration(),
        openFileFolder: "",
        showOpenFileFolder: true,
        folderChar: "\\",
        projectIsDownloading: false,
        compilerNames: CompilerNames,
        newProjectCompiler: 1,
        newProjectRomVersion: "R37",
        romVersionNames: RomVersionNames,
        newProjectDeveloperName: ""
    }
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
export function NewBuildConfiguration(): IBuildConfiguration {
    return {
        addonCommandLine: "",
        compilerType: ProjectCompilerTypes.ACME,
        compilerVariables: "",
        computerType: ProjectComputerTypes.CommanderX16,
        outputFolderName: "output",
        programFileName: "",
        romVersion: "R37"
    };
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