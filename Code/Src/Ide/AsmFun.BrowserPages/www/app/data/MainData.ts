// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IAsmFunAppData } from "../data/AsmFunAppData.js";
import { ICommandManager } from "../framework/ICommandManager.js";
import { IInstructionItemData } from "./ProcessorData.js";
import { IEditorLine, IEditorBundle } from "./EditorData.js";
import { IServiceResolverFactory } from "../serviceLoc/IServiceResolver.js";
import { IEventManager } from "../framework/IAsmFunEventManager.js";


export interface IMainData {
    appData: IAsmFunAppData;
    ctrlKeyIsDown: boolean;
    commandManager: ICommandManager;
    eventManager: IEventManager;
    previousSelectedPC?: IInstructionItemData;
    previousSelectedLine?: IEditorLine;
    sourceCode?: IEditorBundle;
    container: IServiceResolverFactory;
}