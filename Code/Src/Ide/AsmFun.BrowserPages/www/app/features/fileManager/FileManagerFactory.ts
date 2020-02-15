
import { IFeatureFactory } from "../../framework/IFeatureFactory.js";
import * as FileManagerMethods from "./FileManagerMethods.js";
import { FileManager }from "./FileManager.js";
import { IServiceResolverFactory } from "../../framework/serviceLoc/IServiceResolver.js";
import { IMainData } from "../../framework/data/MainData.js";
import { ServiceLifestyle } from "../../framework/serviceLoc/ServiceName.js";
import { FileService } from "./services/FileService.js";

export var UIDataNameFileManager = "fileManager";

export class FileManagerFactory implements IFeatureFactory {

    private container?: IServiceResolverFactory | null;

    public PreRegister() { }

    public GetUIData() {
        return FileManager.NewData();
    }

    public RegisterServices(container: IServiceResolverFactory, mainData: IMainData) {
        this.container = container;
        FileManagerMethods.SetCommandManager(mainData.commandManager);
        container.AddWithConstructor<FileManager>(FileManager.ServiceName, () => new FileManager(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
        container.AddWithConstructor<FileService>(FileService.ServiceName, () => new FileService(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
    }

    public PreInit() {

    }

    public Init() {
        if (this.container == null) return;
        this.container.Resolve<FileManager>(FileManager.ServiceName);
    }

    public Start() {

    }

    public GetDependecies() {
        return [];
    }

    public GetUIDataName() {
        return UIDataNameFileManager;
    }

    public GetName() {
        return "ASMFun.FileManager";
    }

    public GetMethods(): any {
        return FileManagerMethods;
    }
}

