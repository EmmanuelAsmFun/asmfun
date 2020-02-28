import { IInterpretLine } from "./InterpreterData";
import { IPropertyType } from "./EditorData";
import { IUILine } from "../ui/IUILine";

export interface IInterpretPropertyData {
    Values: Uint8Array | null;
    UsedByLines: number[];
    IsPointer: boolean;
    DirtyValue: string;
    Ui: IUIProperty,
    AddressNum: number;
    ValueNum: number;
    Line: IInterpretLine;
    PType: IPropertyType | null;
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
    IsMultiValue: boolean,
    FullValue:string,
    MouseHover: (p: IUIProperty) => void,
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