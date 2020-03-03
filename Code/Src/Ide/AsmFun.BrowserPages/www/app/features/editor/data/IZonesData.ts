import { IInterpretLine } from "./InterpreterData";
import { INavItem, INavUIItem, INavItemUICollection } from "./INavItemCollection";

export interface IZoneData extends INavItem<IUIZone>{
}

export interface IUIZone extends INavUIItem{
}

export interface IUIZonesData extends INavItemUICollection<IUIZone>{
}
export function NewUIZonesData(): IUIZonesData {
    return {
        List: [],
        Search: "",
        SearchChanged: () => { }
    };
}