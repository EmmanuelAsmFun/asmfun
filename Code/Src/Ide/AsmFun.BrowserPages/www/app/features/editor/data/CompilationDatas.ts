import { IUILine } from "../ui/IUILine";

export interface ICompilationError {
    FileIndex: number;
    LineNumber: number;
    Error: string;
    Description: string;
    FileName: string;
    FilePath: string;
    Line: IUILine | null;
}
export interface ICompilationResult {
    rawText?: string;
    errorText?: string;
    hasErrors: boolean;
}

export interface ICompilationData {
    hasErrors: boolean;
    compilerErrors?: string;
    compilerResult?: string;
    compilationIsValid: boolean;
    isVisible: boolean;
    errors?: ICompilationError[];
}
