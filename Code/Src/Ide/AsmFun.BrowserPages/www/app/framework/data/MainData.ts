// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IServiceResolverFactory } from "../serviceLoc/IServiceResolver.js";
import { IAsmFunAppData } from "../../features/player/data/AsmFunAppData.js";
import { ICommandManager } from "../ICommandManager.js";
import { IEventManager } from "../IAsmFunEventManager.js";
import { IControlManager } from "../IControlManager.js";
import { IPopupManager } from "./IPopupData.js";
import { IInstructionItemData } from "../../features/processor/data/ProcessorData.js";
import { IEditorLine, IEditorBundle } from "../../features/editor/data/EditorData.js";


export interface IMainData {
    appData: IAsmFunAppData;
    ctrlKeyIsDown: boolean; // Todo: Remove
    commandManager: ICommandManager;
    eventManager: IEventManager;
    controlManager: IControlManager;
    popupManager: IPopupManager;
    previousSelectedPC?: IInstructionItemData; // Todo: Remove
    previousSelectedLine?: IEditorLine; // Todo: Remove
    container: IServiceResolverFactory;
    GetUIData(featureName: string): any;
}