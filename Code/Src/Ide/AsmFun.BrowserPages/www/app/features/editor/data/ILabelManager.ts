import { IUILabelsData, ILabelData } from "./ILabelsData.js";
import { IInterpretLine } from "./InterpreterData.js";

export interface ILabelManager {
    Find(labelName: string): ILabelData | null;
    FindByAddress(address: number): ILabelData | null;
    FindByHexAddress(hexAddress: string): ILabelData | null;
    GetAll(): ILabelData[];
    Ui: IUILabelsData;
    SetUIData(uiData: IUILabelsData);
    Reset();
    AddLabel(line: IInterpretLine, name: string,isLocalLabel: boolean): ILabelData;
    RemoveLabel(label: ILabelData);
    ParseAddress(name: string, addressNum: number);
    Find(name: string): ILabelData | null;
}