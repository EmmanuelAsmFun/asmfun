import { IInterpretLine } from "./InterpreterData";

export interface IZoneData {
    DirtyName: string;
    Ui: IUIZone,
    AddressNum: number;
    Line: IInterpretLine;
}

export interface IUIZone {
    Name: string;
    LineNumber: number;
    Address: string;
    FileIndex: number;
}

export interface IUIZonesData {
    List: IUIZone[],
    Search: string,
    SearchChanged: () => void,
}
export function NewUIZonesData(): IUIZonesData {
    return {
        List: [],
        Search: "",
        SearchChanged: () => { }
    };
}