
import { IFeatureFactory } from "../../framework/IFeatureFactory.js";
import * as ComputerMethods from "./ComputerMethods.js";
import { ComputerManager } from "./ComputerManager.js";
import { IServiceResolverFactory } from "../../framework/serviceLoc/IServiceResolver.js";
import { ServiceLifestyle } from "../../framework/serviceLoc/ServiceName.js";
import { IMainData } from "../../framework/data/MainData.js";
import { ComputerService } from "./services/ComputerService.js";

export var UIDataNameComputer = "computer";

export class ComputerFactory implements IFeatureFactory {

    private container?: IServiceResolverFactory | null;

    public PreRegister() { }

    public GetUIData() {
        return ComputerManager.NewData();
    }

    public RegisterServices(container: IServiceResolverFactory, mainData: IMainData) {
        this.container = container;
        ComputerMethods.SetCommandManager(mainData.commandManager);
        container.AddWithConstructor<ComputerManager>(ComputerManager.ServiceName, () => new ComputerManager(mainData)).WithLifestyle(ServiceLifestyle.Singleton);

        // Services
        this.container.AddWithConstructor<ComputerService>(ComputerService.ServiceName, () => new ComputerService(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
    }

    public PreInit() {

    }

    public Init() {
        if (this.container == null) return;
        this.container.Resolve<ComputerManager>(ComputerManager.ServiceName);
    }

    public Start() {

    }

    public GetDependecies() {
        return [];
    }

    public GetUIDataName() {
        return UIDataNameComputer;
    }

    public GetName() {
        return "ASMFun.Computer";
    }

    public GetMethods(): any {
        return ComputerMethods;
    }
}

