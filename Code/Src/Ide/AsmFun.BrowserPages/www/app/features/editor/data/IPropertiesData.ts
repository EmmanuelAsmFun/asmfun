import { IPropertyType } from "./EditorData.js";
import { INavItem, INavUIItem, INavItemUICollection } from "./INavItemCollection.js";

export interface IInterpretPropertyData extends INavItem<IUIProperty>{
    Values: Uint8Array | null;
    IsPointer: boolean;
    ValueNum: number;
    DirtyValue: string;
    PType: IPropertyType | null;
}


export interface IUIProperty extends INavUIItem{
    Value: string;
    IsInEditMode: boolean,
    NewValue: string, 
    IsMultiValue: boolean,
    FullValue:string,
    MouseHover: (p: IUIProperty) => void,
}

export interface IUIPropertiesData extends INavItemUICollection<IUIProperty> {
}
export function NewUIPropertiesData(): IUIPropertiesData {
    return {
        List: [],
        Search: "",
        SearchChanged: () => { }
    };
}