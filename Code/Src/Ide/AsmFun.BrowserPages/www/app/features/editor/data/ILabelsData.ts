import { IInterpretLine } from "./InterpreterData";

export interface ILabelData {
    DirtyName: string;
    IsAnonymousLabel: boolean;
    IsLocalLabel: boolean;
    Ui: IUILabel,
    AddressNum: number;
    Line: IInterpretLine;
}

export interface IUILabel {
    Name: string;
    LineNumber: number;
    Address: string;
    FileIndex: number;
    Hilite: boolean;
}

export interface IUILabelsData {
    List: IUILabel[],
    Search: string,
    SearchChanged: () => void,
}
export function NewUILabelsData(): IUILabelsData {
    return {
        List: [],
        Search: "",
        SearchChanged: () => { }
    };
}