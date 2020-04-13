import { ApiService } from "../../../framework/services/ApiService.js";
import { IEventManager } from "../../../framework/IAsmFunEventManager.js";
import { IMainData } from "../../../framework/data/MainData.js";
import { ServiceName } from "../../../framework/serviceLoc/ServiceName.js";
import { IDocRootObject } from "../data/DocumentationDatas.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion



export class DocumentationService extends ApiService {

    private eventManager: IEventManager

    constructor(mainData: IMainData) {
        super();
        this.eventManager = mainData.eventManager;
        this.controllerName = "documentation";
    }

    public GetCommanderX16(doneMethod: (doc: IDocRootObject)=>void) {
        this.callApiCurrentDomain("CommanderX16.json", doneMethod);
    }

    public static ServiceName: ServiceName = { Name: "DocumentationService" };
}