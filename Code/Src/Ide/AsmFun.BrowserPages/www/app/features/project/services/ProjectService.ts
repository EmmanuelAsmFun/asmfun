// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { ISourceCodeBundle, IUserSettings, IProjectSettings, IProjectDetail, IBuildConfiguration, IAddressDataBundle } from "../data/ProjectData.js";
import { IMainData } from "../../../framework/data/MainData.js";
import { IEventManager } from "../../../framework/IAsmFunEventManager.js";
import { ApiService } from "../../../framework/services/ApiService.js";
import { ProjectSettingsLoaded, UserSettingsLoaded } from "../commands/ProjectsCommands.js";
import { ServiceName } from "../../../framework/serviceLoc/ServiceName.js";


export class ProjectService extends ApiService {
   
    private eventManager: IEventManager

    constructor(mainData: IMainData) {
        super();
        this.eventManager = mainData.eventManager;
        this.controllerName = "project";
    }

    public LoadByFileSelectorPopup(doneMethod: (s:IProjectSettings) => void, error: (e) => void) {
        this.callApi("LoadByFileSelectorPopup", (s) => { this.eventManager.InvokeEvent(new ProjectSettingsLoaded(s)); doneMethod(s); }, error);
    }

    public LoadByMainFilename(mainFileNameWithFolder, doneMethod: (s:IProjectSettings) => void, error: (e) => void) {
        this.callApi("LoadByMainFilename?mainFileNameWithFolder=" + encodeURI(mainFileNameWithFolder), (s) => { this.eventManager.InvokeEvent(new ProjectSettingsLoaded(s)); doneMethod(s);}, error);
    }

    public LoadProgram(programFileName, doneMethod: (s:IProjectSettings) => void, error: (e) => void) {
        this.callApi("LoadProgram?programFileName=" + encodeURI(programFileName), (s) => { this.eventManager.InvokeEvent(new ProjectSettingsLoaded(s)); doneMethod(s); }, error);
    }

    public GetSourceCode(doneMethod) {
        this.callApi("GetSourceCode", doneMethod);
    }

    public LoadCompiled(doneMethod: (bundle: any) => void) {
        this.callApi("LoadCompiled", doneMethod);
    }

    public Save(bundle: ISourceCodeBundle, doneMethod, error: (e) => void) {
        this.post("Save", bundle, doneMethod, error);
    }

    public SaveUserSettings(data: IUserSettings, doneMethod, error: (e) => void) {
        this.post("SaveUserSettings", data, () => { this.eventManager.InvokeEvent(new UserSettingsLoaded(data)); doneMethod(data); }, error);
    }

    public SaveProjectSettings(data: IProjectSettings, doneMethod, error: (e) => void) {
        this.post("SaveProjectSettings", data, (s) => { this.eventManager.InvokeEvent(new UserSettingsLoaded(s)); doneMethod(s); }, error);
    }

    public GetUserSettings(doneMethod: (r: IUserSettings) => void, error: (e) => void) {
        this.callApi("GetUserSettings", (s) => { this.eventManager.InvokeEvent(new UserSettingsLoaded(s)); doneMethod(s); }, error);
    }

    public GetProjectSettings(doneMethod: (r: IProjectSettings) => void, error:(e)=> void) {
        this.callApi("GetProjectSettings", (s) => { this.eventManager.InvokeEvent(new ProjectSettingsLoaded(s)); doneMethod(s); },error);
    }

    public CreateNew(nameForFileSystem: string,developerName:string, buildConfiguration: IBuildConfiguration, doneMethod: (IProjectSettings) => void) {
        this.post("CreateNew?nameForFileSystem=" + encodeURI(nameForFileSystem) + "&developerName=" + encodeURI(developerName), buildConfiguration, doneMethod);
    }

    public LoadWebExisting(detail: IProjectDetail, doneMethod: (s:IProjectSettings) => void, error: (e) => void) {
        this.post("LoadWebExisting", detail, (s) => { this.eventManager.InvokeEvent(new ProjectSettingsLoaded(s)); doneMethod(s); }, error);
    }

    public LoadLocalExisting(detail: IProjectDetail, doneMethod: (s:IProjectSettings) => void, error: (e) => void) {
        this.post("LoadLocalExisting", detail, (s) => { this.eventManager.InvokeEvent(new ProjectSettingsLoaded(s)); doneMethod(s); }, error);
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