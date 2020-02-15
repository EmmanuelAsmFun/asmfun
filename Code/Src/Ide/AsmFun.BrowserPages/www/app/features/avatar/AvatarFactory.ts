
import { IFeatureFactory } from "../../framework/IFeatureFactory.js";
import * as AvatarMethods from "./AvatarMethods.js";
import { AvatarManager } from "./AvatarManager.js";
import { IServiceResolverFactory, IServiceResolver } from "../../framework/serviceLoc/IServiceResolver.js";
import { IMainData } from "../../framework/data/MainData.js";
import { ServiceLifestyle } from "../../framework/serviceLoc/ServiceName.js";


export var UIDataNameAvatar = "avatar";

export class AvatarFactory implements IFeatureFactory{
   
    private container?: IServiceResolver | null;

    public PreRegister() {}

    public GetUIData() {
        return AvatarManager.NewData();
    }

    public RegisterServices(container: IServiceResolverFactory, mainData: IMainData) {
        this.container = container;
        AvatarMethods.SetCommandManager(mainData.commandManager);
        container.AddWithConstructor<AvatarManager>(AvatarManager.ServiceName, () => new AvatarManager(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
    }

    public PreInit() {
        
    }

    public Init() {
        if (this.container == null) return;
        this.container.Resolve<AvatarManager>(AvatarManager.ServiceName);
    }

    public Start() {

    }

    public GetDependecies() {
        return [];
    }

    public GetUIDataName() {
        return UIDataNameAvatar;
    }

    public GetName() {
        return "ASMFun.Avatar";
    }

    public GetMethods():any {
        return AvatarMethods;
    }
}

