import { IUIPropertiesData, IInterpretPropertyData } from "./IPropertiesData.js";
import { IInterpretLine } from "./InterpreterData.js";
import { ISourceCodeLabel, IAddressDataLabel } from "../../project/data/ProjectData.js";
import { InterpreterLine } from "../interpreters/InterpreterLine.js";
import { IPropertyType } from "./EditorData.js";

export interface IPropertyManager {
    
    
    GetAll(): IInterpretPropertyData[];
    Ui: IUIPropertiesData;
    SetUIData(uiData: IUIPropertiesData);
    Reset();
    AddProperty(line: IInterpretLine, name: string, value: string, propType: IPropertyType): IInterpretPropertyData;
    RemoveProperty(property: IInterpretPropertyData);

    ParseAddress(name: string, addressNum: number);
    ParseValueDatas(l: IAddressDataLabel[]);
    AddUsedBy(property: IInterpretPropertyData, lineI: InterpreterLine);

    Find(name: string): IInterpretPropertyData | null;
    FindByAddress(address: number): IInterpretPropertyData | null;
    FindByHexAddress(hexAddress: string): IInterpretPropertyData | null;

    
}