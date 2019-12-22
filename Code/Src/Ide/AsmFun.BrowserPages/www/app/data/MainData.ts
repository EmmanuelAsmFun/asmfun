// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { IAsmFunAppData } from "../data/AsmFunAppData.js";
import { ICommandManager } from "../framework/ICommandManager.js";
import { IInstructionItemData } from "./ProcessorData.js";
import { IEditorLine, IEditorBundle } from "./EditorData.js";
import { IServiceResolverFactory } from "../serviceLoc/IServiceResolver.js";


export interface IMainData {
    appData: IAsmFunAppData;
    ctrlKeyIsDown: boolean;
    commandManager: ICommandManager;
    previousSelectedPC?: IInstructionItemData;
    previousSelectedLine?: IEditorLine;
    sourceCode?: IEditorBundle;
    container: IServiceResolverFactory;
}