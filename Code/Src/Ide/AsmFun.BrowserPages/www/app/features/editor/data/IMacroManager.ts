import { IUIMacrosData, IMacroData } from "./IMacrosData.js";
import { IInterpretLine } from "./InterpreterData.js";

export interface IMacroManager {
    GetAll(): IMacroData[];
    Ui: IUIMacrosData;
    SetUIData(uiData: IUIMacrosData);
    Reset();
    AddMacro(line: IInterpretLine, name:string): IMacroData;
    RemoveMacro(zone: IMacroData);
    ParseAddress(name: string, addressNum: number);
    Find(name: string): IMacroData | null;
}