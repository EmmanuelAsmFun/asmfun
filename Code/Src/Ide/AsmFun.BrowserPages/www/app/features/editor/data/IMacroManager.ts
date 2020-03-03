import { IUIMacrosData, IMacroData } from "./IMacrosData.js";
import { IInterpretLine } from "./InterpreterData.js";
import { InterpreterLine } from "../interpreters/InterpreterLine.js";

export interface IMacroManager {
    AddUsedBy(macro: IMacroData, lineI: InterpreterLine);
    GetAll(): IMacroData[];
    Ui: IUIMacrosData;
    SetUIData(uiData: IUIMacrosData);
    Reset();
    AddMacro(line: IInterpretLine, name:string): IMacroData;
    RemoveMacro(zone: IMacroData);
    ParseAddress(name: string, addressNum: number);
    Find(name: string): IMacroData | null;
}