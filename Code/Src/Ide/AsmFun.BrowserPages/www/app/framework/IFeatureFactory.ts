import { IServiceResolverFactory } from "./serviceLoc/IServiceResolver.js";
import { IMainData } from "./data/MainData.js";


export interface IFeatureFactory {

    GetUIData(data: any):any;

    PreRegister();

    RegisterServices(container: IServiceResolverFactory, mainData: IMainData);

    Init();
    PreInit();
    Start()

    GetDependecies();

    GetName();

    GetUIDataName();

    GetMethods(): any;
}