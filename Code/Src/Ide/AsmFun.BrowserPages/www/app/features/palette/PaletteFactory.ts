
import { IFeatureFactory } from "../../framework/IFeatureFactory.js";
import * as PaletteMethods from "./PaletteMethods.js";
import { IServiceResolverFactory } from "../../framework/serviceLoc/IServiceResolver.js";
import { IMainData } from "../../framework/data/MainData.js";

export var UIDataName = "palette";

export class PaletteFactory implements IFeatureFactory{
   
    private container?: IServiceResolverFactory | null;

    public PreRegister() {}

    public GetUIData() {
        return null; //PaletteManager.NewData();
    }

    public RegisterServices(container: IServiceResolverFactory, mainData: IMainData) {
        this.container = container;
        PaletteMethods.SetCommandManager(mainData.commandManager);
        //container.AddWithConstructor<PaletteManager>(PaletteManager.ServiceName, () => new PaletteManager(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
    }

    public PreInit() {
        
    }

    public Init() {
        if (this.container == null) return;
        //this.container.Resolve<PaletteManager>(PaletteManager.ServiceName);
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
        return "ASMFun.Palette";
    }

    public GetMethods():any {
        return PaletteMethods;
    }
}

