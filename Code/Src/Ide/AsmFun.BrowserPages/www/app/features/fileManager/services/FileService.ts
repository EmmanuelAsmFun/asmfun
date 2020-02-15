// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { ApiService } from "../../../framework/services/ApiService.js";
import { IAsmFile,IAsmFolder } from "../data/FileManagerData.js";
import { ServiceName } from "../../../framework/serviceLoc/ServiceName.js";
import { IEventManager } from "../../../framework/IAsmFunEventManager.js";
import { IMainData } from "../../../framework/data/MainData.js";



export class FileService extends ApiService {

    eventManager: IEventManager;

    constructor(mainData: IMainData) {
        super();
        this.eventManager = mainData.eventManager;
        this.controllerName = "file";
         
    }

    public GetFiles(folderName: string, filter: string, doneMethod: (f: IAsmFolder) => void, error: ((e) => void) | null) {
        this.callApi("GetFiles?folderName=" + encodeURI(folderName) + "&filter=" + encodeURI(filter), doneMethod, error);
    }

   

    public static ServiceName: ServiceName = { Name: "FileService" };
}