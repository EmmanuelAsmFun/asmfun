
import { IFeatureFactory } from "../../framework/IFeatureFactory.js";
import * as PlayerMethods from "./PlayerMethods.js";

import { ASMFunPlayerManager } from "./ASMFunPlayerManager.js";
import { IMainData } from "../../framework/data/MainData.js";
import { IServiceResolverFactory } from "../../framework/serviceLoc/IServiceResolver.js";
import { ServiceLifestyle } from "../../framework/serviceLoc/ServiceName.js";

export var UIDataNamePlayer = "ide";

export class PlayerFactory implements IFeatureFactory{
   
    private container?: IServiceResolverFactory | null;

    public PreRegister() {}

    public GetUIData() {
        return ASMFunPlayerManager.NewData();
    }

    public RegisterServices(container: IServiceResolverFactory, mainData: IMainData) {
        this.container = container;
        PlayerMethods.SetCommandManager(mainData.commandManager);
        container.AddWithConstructor<ASMFunPlayerManager>(ASMFunPlayerManager.ServiceName, () => new ASMFunPlayerManager(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
    }

    public PreInit() {
        
    }

    public Init() {
        if (this.container == null) return;
        this.container.Resolve<ASMFunPlayerManager>(ASMFunPlayerManager.ServiceName);
    }

    public Start() {

    }

    public GetDependecies() {
        return [];
    }

    public GetUIDataName() {
        return UIDataNamePlayer;
    }

    public GetName() {
        return "ASMFun.Player";
    }

    public GetMethods():any {
        return PlayerMethods;
    }
}

