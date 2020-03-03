import { InterpreterLine } from "../interpreters/InterpreterLine.js";
import { IInterpretLine } from "./InterpreterData.js";

export interface INavItem<TNavItemUIItem extends INavUIItem> {
    DirtyName: string;
    Line: IInterpretLine;
    UsedByLines: InterpreterLine[];
    Ui: TNavItemUIItem,
    AddressNum: number;
}

export interface INavUIItem {
    Name: string;
    LineNumber: number;
    FileIndex: number;
    Hilite: boolean;
    UsedByLines: { FileIndex: number, LineNumber: number, Text: string }[];
    ShowUsedBy: boolean;
    Address: string;
}
export interface INavItemUICollection<TNavItemUIItem extends INavUIItem> {
    List: TNavItemUIItem[],
    Search: string,
    SearchChanged: () => void,
}