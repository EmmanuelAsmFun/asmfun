
import { IFeatureFactory } from "../../framework/IFeatureFactory.js";
import * as SettingsMethods from "./SettingsMethods.js";
import { SettingsManager } from "./SettingsManager.js";
import { IMainData } from "../../framework/data/MainData.js";
import { IServiceResolverFactory } from "../../framework/serviceLoc/IServiceResolver.js";
import { ServiceLifestyle } from "../../framework/serviceLoc/ServiceName.js";

export var UIDataNameSettings = "settings";

export class SettingsFactory implements IFeatureFactory {

    private container?: IServiceResolverFactory | null;

    public PreRegister() { }

    public GetUIData() {
        return SettingsManager.NewData();
    }

    public RegisterServices(container: IServiceResolverFactory, mainData: IMainData) {
        this.container = container;
        SettingsMethods.SetCommandManager(mainData.commandManager);
        container.AddWithConstructor<SettingsManager>(SettingsManager.ServiceName, () => new SettingsManager(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
    }

    public PreInit() {

    }

    public Init() {
        if (this.container == null) return;
        this.container.Resolve<SettingsManager>(SettingsManager.ServiceName);
    }

    public Start() {

    }

    public GetDependecies() {
        return [];
    }

    public GetUIDataName() {
        return UIDataNameSettings;
    }

    public GetName() {
        return "ASMFun.Settings";
    }

    public GetMethods(): any {
        return SettingsMethods;
    }
}

