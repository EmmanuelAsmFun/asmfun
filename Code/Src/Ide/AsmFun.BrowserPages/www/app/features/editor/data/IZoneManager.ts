import { IUIZonesData, IZoneData } from "./IZonesData.js";
import { IInterpretLine } from "./InterpreterData.js";

// Switch to new zone of local symbols. Zones can either be nested or used sequentially.
// TITLE: May consist of letters and digits. Its only purpose is to be displayed in error messages, so it'll be omitted in most cases.
// BLOCK: A block of assembler statements
// If no block is given, the previous zone is terminated and the new zone is started.
// If a block is given, the old zone continues after the block.
export interface IZoneManager {
    Ui: IUIZonesData;
    SetUIData(uiData: IUIZonesData);
    Reset();
    AddZone(line: IInterpretLine, zoneName: string): IZoneData;
    RemoveZone(zone: IZoneData);
    ParseAddress(name: string, addressNum: number);
    Find(name: string): IZoneData | null;
}