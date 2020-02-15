
import { IFeatureFactory } from "../../framework/IFeatureFactory.js";
import * as KeyboardMethods from "./KeyboardMethods.js";
import { KeyboardManager } from "./KeyboardManager.js";
import { IMainData } from "../../framework/data/MainData.js";
import { IServiceResolverFactory } from "../../framework/serviceLoc/IServiceResolver.js";
import { ServiceLifestyle } from "../../framework/serviceLoc/ServiceName.js";

export var UIDataName = "keyboard";

export class KeyboardFactory implements IFeatureFactory{
   
    private container?: IServiceResolverFactory | null;

    public PreRegister() {}

    public GetUIData() {
        return null; // KeyboardManager.NewData();
    }

    public RegisterServices(container: IServiceResolverFactory, mainData: IMainData) {
        this.container = container;
        KeyboardMethods.SetCommandManager(mainData.commandManager);
        container.AddWithConstructor<KeyboardManager>(KeyboardManager.ServiceName, () => new KeyboardManager(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
    }

    public PreInit() {
        
    }

    public Init() {
        if (this.container == null) return;
        this.container.Resolve<KeyboardManager>(KeyboardManager.ServiceName);
    }

    public Start() {

    }

    public GetDependecies() {
        return [];
    }

    public GetUIDataName() {
        return UIDataName;
    }

    public GetName() {
        return "ASMFun.Keyboard";
    }

    public GetMethods():any {
        return KeyboardMethods;
    }
}

