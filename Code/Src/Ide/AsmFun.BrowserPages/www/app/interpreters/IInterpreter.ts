// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { ICodeBlockContext, IEditorLine } from "../data/EditorData.js";

export interface IInterpreter {
    InterpretLine(context: ICodeBlockContext, line: IEditorLine, fullParse: boolean): ICodeBlockContext;
}