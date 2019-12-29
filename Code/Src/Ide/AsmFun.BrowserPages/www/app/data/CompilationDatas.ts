export interface ICompilationError {
    lineNumber: number;
    error: string;
    description: string;
    fileName: string;
    filePath: string;
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
