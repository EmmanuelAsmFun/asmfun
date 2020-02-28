// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IEditorLine, IPropertyType } from "../data/EditorData.js";
import { ICompilationError, ICompilationResult } from "../data/CompilationDatas.js";
import { IInterpretLine } from "../data/InterpreterData.js";
import { InterpreterBlock } from "../interpreters/InterpreterBlock.js";
import { InterpreterLine } from "./InterpreterLine.js";
import { InterpreterBundle } from "./InterpreterBundle.js";

export interface IInterpreter {
    GetCompilerName(): string;
    GetCompilerResultErrors(c: ICompilationResult): ICompilationError[];
    InterpretLineParts(bundle: InterpreterBundle,interpretLine: InterpreterLine);

    ConvertToPropertyType(propType: string, data: string): IPropertyType;
}