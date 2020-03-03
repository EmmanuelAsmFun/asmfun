import { INavItem, INavUIItem, INavItemUICollection } from "./INavItemCollection.js";

export interface IMacroData extends INavItem<IUIMacro>{
    ParameterNames: string[];
}

export interface IUIMacro extends INavUIItem{
    ParametersNames: string;
}

export interface IUIMacrosData extends INavItemUICollection<IUIMacro>{
}
export function NewUIMacrosData(): IUIMacrosData {
    return {
        List: [],
        Search: "",
        SearchChanged: () => { }
    };
}