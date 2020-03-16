
// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion
export interface IDocumentationData {
    isVisible: boolean;
    isVisiblePopup: boolean;
    ComputerDoc: IDocRootObject | null;
    ComputerDocByAddress: IDocFunction[];
    ShowByAddress: boolean;
    ShowGeneral: boolean;
    SelectByAddress: (f: IDocFunction)=> void,
}


export interface IDocVariableDefinition {
    Code: string;
    Name: string;
    Description: string;
    Tags: string[];
    Values: IDocVariableDefDescription[];
}
export interface IDocVariableDefDescription {
    HexValue: string;
    Name: string;
    Comment: string;
    Code: string;
    Color: string;
    Category: string;
    Categories: string[];
}

export interface IDocParameter {
    Name: string;
    Target: string;
    Type: string;
    LinkTarget: string;
    Description: string;
    Code: string;
    IsOptional: boolean;
    Values: IDocParameterDescription[];
}


export interface IDocParameterDescription {
    Value: string;
    Name: string;
}


export interface IDocFlag {
    Value: string;
    Name: string;
    Code: string;
}

export interface IDocReturnParameter {
    Name: string;
    Code: string;
    Target: string;
    Type: string;
    Flags: IDocFlag[];
    Description: string;
}

export interface IDocFunction {
    Group: IDocGroup;
    VariableDescriptions: IDocVariableDefinition[];
    AddressHex: string;
    Code: string;
    Name: string;
    Description: string;
    Affects: string[];
    Tags: string[];
    LongDescription: string;
    Parameters: IDocParameter[];
    Returns: IDocReturnParameter[];
    Signature: string;
    Tutorials: string[];
    IsVisible: boolean;
    SwapVisible: () => void;
}

export interface IDocGroup {
    Name: string;
    Description: string;
    Functions: IDocFunction[];
    IsVisible: boolean;
    SwapVisible: () => void;
}

export interface IDocRootObject {
    GeneralInfos: IDocGeneralInfo[];
    VariableDefinitions: IDocVariableDefinition[];
    Groups: IDocGroup[];
}

export interface IDocGeneralInfo {
    Group: IDocGroup;
    Name: string;
    Description: string;
    LongDescription: string;
    IsVisible: boolean;
    SwapVisible: () => void;
}
