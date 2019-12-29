// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { ICodeBlockContext, IEditorLine } from "../data/EditorData.js";
import { ICompilationError, ICompilationResult } from "../data/CompilationDatas.js";

export interface IInterpreter {
    GetCompilerName(): string;
    GetCompilerResultErrors(c: ICompilationResult): ICompilationError[];
    InterpretLine(context: ICodeBlockContext, line: IEditorLine, fullParse: boolean): ICodeBlockContext;
}