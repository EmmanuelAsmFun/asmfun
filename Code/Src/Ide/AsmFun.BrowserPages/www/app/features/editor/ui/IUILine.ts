import { ILineError } from "../data/EditorData.js";
import { IUIProperty } from "../data/IPropertiesData.js";

export interface IUILine {
    HasError:boolean,
    CanSetBreakPoint:boolean,
    HasBreakPoint:boolean,
    Selected:boolean,
    Hilite: boolean,
    Address: string,
    AsmFunCode: string,
    Html: string,
    LineNumber: number,
    FileIndex: number,
    CanEditProp:boolean,
    Error: ILineError | null,
    Prop: IUIProperty | null,
}
export function NewUiLine(): IUILine {
    return {
        HasError: false,
        CanSetBreakPoint: false,
        HasBreakPoint : false,
        Selected: false,
        Hilite: false,
        Address: "",
        AsmFunCode: "",
        Html: "",
        LineNumber: 0,
        FileIndex: 0,
        CanEditProp:false,
        Error: null,
        Prop:null,
    }
}