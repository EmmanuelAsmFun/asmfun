
import { IFeatureFactory } from "../../framework/IFeatureFactory.js";
import * as MemoryMethods from "./MemoryMethods.js";
import { MemoryManager } from "./MemoryManager.js";
import { IServiceResolverFactory } from "../../framework/serviceLoc/IServiceResolver.js";
import { IMainData } from "../../framework/data/MainData.js";
import { ServiceLifestyle } from "../../framework/serviceLoc/ServiceName.js";

export var UIDataNameMemory = "memoryViewer";

export class MemoryFactory implements IFeatureFactory{
   
    private container?: IServiceResolverFactory | null;

    public PreRegister() {}

    public GetUIData() {
        return MemoryManager.NewData();
    }

    public RegisterServices(container: IServiceResolverFactory, mainData: IMainData) {
        this.container = container;
        MemoryMethods.SetCommandManager(mainData.commandManager);
        container.AddWithConstructor<MemoryManager>(MemoryManager.ServiceName, () => new MemoryManager(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
    }

    public PreInit() {
        
    }

    public Init() {
        if (this.container == null) return;
        this.container.Resolve<MemoryManager>(MemoryManager.ServiceName);
    }

    public Start() {

    }

    public GetDependecies() {
        return [];
    }

    public GetUIDataName() {
        return UIDataNameMemory;
    }

    public GetName() {
        return "ASMFun.Memory";
    }

    public GetMethods():any {
        return MemoryMethods;
    }
}

