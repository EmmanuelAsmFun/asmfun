
import { IFeatureFactory } from "../../framework/IFeatureFactory.js";
import * as ProjectMethods from "./ProjectMethods.js";
import { ProjectManager } from "./ProjectManager.js";
import { IServiceResolverFactory } from "../../framework/serviceLoc/IServiceResolver.js";
import { IMainData } from "../../framework/data/MainData.js";
import { ServiceLifestyle } from "../../framework/serviceLoc/ServiceName.js";
import { ProjectService } from "./services/ProjectService.js";

export var UIDataNameProject = "projectManager";

export class ProjectFactory implements IFeatureFactory{
   
    private container?: IServiceResolverFactory | null;

    public PreRegister() {}

    public GetUIData() {
        return ProjectManager.NewData();
    }

    public RegisterServices(container: IServiceResolverFactory, mainData: IMainData) {
        this.container = container;
        ProjectMethods.SetCommandManager(mainData.commandManager);
        container.AddWithConstructor<ProjectManager>(ProjectManager.ServiceName, () => new ProjectManager(mainData)).WithLifestyle(ServiceLifestyle.Singleton);

        container.AddWithConstructor<ProjectService>(ProjectService.ServiceName, () => new ProjectService(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
    }

    public PreInit() {
        
    }

    public Init() {
        if (this.container == null) return;
        this.container.Resolve<ProjectManager>(ProjectManager.ServiceName);
    }

    public Start() {

    }

    public GetDependecies() {
        return [];
    }

    public GetUIDataName() {
        return UIDataNameProject;
    }

    public GetName() {
        return "ASMFun.Project";
    }

    public GetMethods():any {
        return ProjectMethods;
    }
}

