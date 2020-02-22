import { IInterpretLine } from "./InterpreterData.js";

export interface IMacroData {
    DirtyName: string;
    Ui: IUIMacro,
    AddressNum: number;
    Line: IInterpretLine;
}

export interface IUIMacro {
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