
import { IFeatureFactory } from "../../framework/IFeatureFactory.js";
import * as PainterMethods from "./PainterMethods.js";
import { PainterManager } from "./PainterManager.js";
import { IServiceResolverFactory } from "../../framework/serviceLoc/IServiceResolver.js";
import { IMainData } from "../../framework/data/MainData.js";
import { ServiceLifestyle } from "../../framework/serviceLoc/ServiceName.js";

export var UIDataNamePainter = "painterManager";

export class PainterFactory implements IFeatureFactory{
   
    private container?: IServiceResolverFactory | null;

    public PreRegister() {}

    public GetUIData() {
        return PainterManager.NewData();
    }

    public RegisterServices(container: IServiceResolverFactory, mainData: IMainData) {
        this.container = container;
        PainterMethods.SetCommandManager(mainData.commandManager);
        container.AddWithConstructor<PainterManager>(PainterManager.ServiceName, () => new PainterManager(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
    }

    public PreInit() {
        
    }

    public Init() {
        if (this.container == null) return;
        this.container.Resolve<PainterManager>(PainterManager.ServiceName);
    }

    public Start() {

    }

    public GetDependecies() {
        return ["ASMFun.Palette"];
    }

    public GetUIDataName() {
        return UIDataNamePainter;
    }

    public GetName() {
        return "ASMFun.Painter";
    }

    public GetMethods():any {
        return PainterMethods;
    }
}

