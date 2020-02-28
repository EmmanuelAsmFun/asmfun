import { IInterpretLine } from "./InterpreterData.js";

export interface IMacroData {
    ParameterNames: string[];
    DirtyName: string;
    Ui: IUIMacro,
    AddressNum: number;
    Line: IInterpretLine;
}

export interface IUIMacro {
    ParametersNames: string;
    Name: string;
    Address: string;
    LineNumber: number;
    FileIndex: number;
}

export interface IUIMacrosData {
    List: IUIMacro[],
    Search: string,
    SearchChanged: () => void,
}
export function NewUIMacrosData(): IUIMacrosData {
    return {
        List: [],
        Search: "",
        SearchChanged: () => { }
    };
}