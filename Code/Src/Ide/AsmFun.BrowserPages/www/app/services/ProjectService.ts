// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { ApiService } from "./ApiService.js";
import { ISourceCodeBundle, IUserSettings, IProjectSettings, IProjectDetail, IBuildConfiguration } from "../data/ProjectData.js";
import { ServiceName } from "../serviceLoc/ServiceName.js";


export class ProjectService extends ApiService {
   
  

    constructor() {
        super();
        this.controllerName = "project";
    }

    public LoadByFileSelectorPopup(doneMethod: (IProjectSettings) => void, error: (e) => void) {
        this.callApi("LoadByFileSelectorPopup", doneMethod, error);
    }

    public LoadByMainFilename(mainFileNameWithFolder, doneMethod: (IProjectSettings) => void, error: (e) => void) {
        this.callApi("LoadByMainFilename?mainFileNameWithFolder=" + encodeURI(mainFileNameWithFolder), doneMethod, error);
    }

    public LoadProgram(programFileName, doneMethod: (IProjectSettings) => void, error: (e) => void) {
        this.callApi("LoadProgram?programFileName=" + encodeURI(programFileName), doneMethod, error);
    }

    public GetSourceCode(doneMethod) {
        this.callApi("GetSourceCode", doneMethod);
    }

    public LoadCompiled(doneMethod) {
        this.callApi("LoadCompiled", doneMethod);
    }

    public Save(bundle: ISourceCodeBundle, doneMethod, error: (e) => void) {
        this.post("Save", bundle, doneMethod, error);
    }

    public SaveUserSettings(data: IUserSettings, doneMethod) {
        this.post("SaveUserSettings", data, doneMethod);
    }

    public SaveProjectSettings(data: IProjectSettings, doneMethod) {
        this.post("SaveProjectSettings", data, doneMethod);
    }

    public GetUserSettings(doneMethod: (r: IUserSettings) => void, error: (e) => void) {
        this.callApi("GetUserSettings", doneMethod, error);
    }

    public GetProjectSettings(doneMethod: (r: IProjectSettings) => void, error:(e)=> void) {
        this.callApi("GetProjectSettings", doneMethod,error);
    }

    public CreateNew(nameForFileSystem: string,developerName:string, buildConfiguration: IBuildConfiguration, doneMethod: (IProjectSettings) => void) {
        this.post("CreateNew?nameForFileSystem=" + encodeURI(nameForFileSystem) + "&developerName=" + encodeURI(developerName), buildConfiguration, doneMethod);
    }

    public LoadWebExisting(detail: IProjectDetail, doneMethod: (IProjectSettings) => void, error: (e) => void) {
        this.post("LoadWebExisting", detail, doneMethod, error);
    }

    public LoadLocalExisting(detail: IProjectDetail, doneMethod: (IProjectSettings) => void, error: (e) => void) {
        this.post("LoadLocalExisting", detail, doneMethod, error);
    }

    public GetWebProjects(doneMethod: (w: IProjectDetail[]) => void) {
        if (document.location.host.indexOf("localhost") > -1)
            this.callApi("GetWebProjects", doneMethod);
        else
            this.callApiCurrentDomain("GetWebProjects.json", doneMethod);
    }
    public SelectBuildConfigurationByIndex(index, doneMethod: () => void) {
        this.callApi("SelectBuildConfigurationByIndex?index=" + index, doneMethod);
    }

    public static ServiceName: ServiceName = { Name: "ProjectService" };
}