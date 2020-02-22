import { IInterpretLine } from "./InterpreterData";
import { IPropertyData } from "./EditorData";
import { IUILine } from "../ui/IUILine";

export interface IInterpretPropertyData {
    UsedByLines: number[];
    
    IsPointer: boolean;
    DirtyValue: string;
    Ui: IUIProperty,
    AddressNum: number;
    ValueNum: number;
    Line: IInterpretLine;
    Data: IPropertyData | null;
}


export interface IUIProperty {
    Name: string;
    Address: string;
    LineNumber: number;
    Value: string;
    Hilite: boolean;
    FileIndex: number;
    IsInEditMode: boolean,
    NewValue: string, 
}

export interface IUIPropertiesData {
    List: IUIProperty[],
    Search: string,
    SearchChanged: () => void,
}
export function NewUIPropertiesData(): IUIPropertiesData {
    return {
        List: [],
        Search: "",
        SearchChanged: () => { }
    };
}