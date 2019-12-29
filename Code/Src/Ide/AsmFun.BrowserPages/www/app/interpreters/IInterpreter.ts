// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { ICodeBlockContext, IEditorLine } from "../data/EditorData.js";

export interface IInterpreter {
    InterpretLine(context: ICodeBlockContext, line: IEditorLine, fullParse: boolean): ICodeBlockContext;
}