import { InterpreterLine } from "../interpreters/InterpreterLine";

export interface IUIFindReplaceData {
    IsVisible: boolean;
    SearchWord: string;
    IsRegEx: boolean;
    MatchCase: boolean;
    MatchWord: boolean;
    ReplaceWord: string;
    ResultsCount: number;
}

export function NewFindReplaceData(): IUIFindReplaceData{
    return {
        IsVisible: false,
        SearchWord: "",
        IsRegEx: false,
        MatchCase: false,
        MatchWord: false,
        ReplaceWord: "",
        ResultsCount:0,
    };
}

export interface IFindReplaceJob {
    Search: string;
    Results: IFindReplaceResultItem[];
    LastViewIndex: number;
    LastFileIndex: number;
    IsRegEx: boolean,
    MatchCase: boolean,
    MatchWord: boolean,
}
export interface IFindReplaceResultItem {
    LineNumber: number;
    FileIndex: number;
    XOffset: number;
    Length: number;
    Line: InterpreterLine;
    IsReplaced: boolean;
}