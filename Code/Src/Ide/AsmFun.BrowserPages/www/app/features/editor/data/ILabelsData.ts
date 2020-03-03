import { INavItem, INavItemUICollection, INavUIItem } from "./INavItemCollection.js";
import { IInterpretLine } from "./InterpreterData.js";
import { InterpreterLine } from "../interpreters/InterpreterLine.js";


export interface ILabelData extends INavItem<IUILabel>{
    IsAnonymousLabel: boolean;
    IsLocalLabel: boolean;
}

export interface IUILabel extends INavUIItem{
    
}

export interface IUILabelsData extends INavItemUICollection<IUILabel> {
}
export function NewUILabelsData(): IUILabelsData {
    return {
        List: [],
        Search: "",
        SearchChanged: () => { }
    };
}
