
import { IFeatureFactory } from "../../framework/IFeatureFactory.js";
import * as DocumentationMethods from "./DocumentationMethods.js";
import { DocumentationManager } from "./DocumentationManager.js";
import { IMainData } from "../../framework/data/MainData.js";
import { IServiceResolverFactory } from "../../framework/serviceLoc/IServiceResolver.js";
import { ServiceLifestyle } from "../../framework/serviceLoc/ServiceName.js";
import { DocumentationService } from "./services/DocumentationService.js";

export var UIDataNameDocumentation = "documentation";

export class DocumentationFactory implements IFeatureFactory {

    private container?: IServiceResolverFactory | null;

    public PreRegister() { }

    public GetUIData() {
        return DocumentationManager.NewData();
    }

    public RegisterServices(container: IServiceResolverFactory, mainData: IMainData) {
        this.container = container;
        DocumentationMethods.SetCommandManager(mainData.commandManager);
        container.AddWithConstructor<DocumentationManager>(DocumentationManager.ServiceName, () => new DocumentationManager(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
        container.AddWithConstructor<DocumentationService>(DocumentationService.ServiceName, () => new DocumentationService(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
    }

    public PreInit() {

    }

    public Init() {
        if (this.container == null) return;
        this.container.Resolve<DocumentationManager>(DocumentationManager.ServiceName);
    }

    public Start() {

    }

    public GetDependecies() {
        return [];
    }

    public GetUIDataName() {
        return UIDataNameDocumentation;
    }

    public GetName() {
        return "ASMFun.Documentation";
    }

    public GetMethods(): any {
        return DocumentationMethods;
    }
}

