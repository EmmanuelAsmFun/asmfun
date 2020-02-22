import { IUIPropertiesData, IInterpretPropertyData } from "./IPropertiesData.js";
import { IInterpretLine } from "./InterpreterData.js";
import { ISourceCodeLabel } from "../../project/data/ProjectData.js";
import { InterpreterLine } from "../interpreters/InterpreterLine.js";

export interface IPropertyManager {
    
    
    GetAll(): IInterpretPropertyData[];
    Ui: IUIPropertiesData;
    SetUIData(uiData: IUIPropertiesData);
    Reset();
    AddProperty(line: IInterpretLine, name: string, value: string): IInterpretPropertyData;
    RemoveProperty(property: IInterpretPropertyData);

    ParseAddress(name: string, addressNum: number);
    ParseValueDatas(l: ISourceCodeLabel[]);
    AddUsedBy(property: IInterpretPropertyData, lineI: InterpreterLine);

    Find(name: string): IInterpretPropertyData | null;
    FindByAddress(address: number): IInterpretPropertyData | null;
    FindByHexAddress(hexAddress: string): IInterpretPropertyData | null;

    
}