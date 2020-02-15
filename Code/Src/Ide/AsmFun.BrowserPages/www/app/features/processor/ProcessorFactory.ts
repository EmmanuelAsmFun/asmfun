// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IFeatureFactory } from "../../framework/IFeatureFactory.js";
import * as ProcessorMethods from "./ProcessorMethods.js";
import { ProcessorManager } from "./ProcessorManager.js";
import { IServiceResolverFactory } from "../../framework/serviceLoc/IServiceResolver.js";
import { IMainData } from "../../framework/data/MainData.js";
import { ServiceLifestyle } from "../../framework/serviceLoc/ServiceName.js";
import { NewProcessorManagerData } from "./data/ProcessorData.js";
import { DebuggerService } from "./services/DebuggerService.js";
import { BreakPointsManager } from "./BreakPointsManager.js";
import { NewBreakPointsManagerData, UIDataNameBreakPoints } from "./data/BreakPointsData.js";

export var UIDataNameProcessor = "processor";

export class ProcessorFactory implements IFeatureFactory{
   
    private container?: IServiceResolverFactory | null;

    public PreRegister() {}

    public GetUIData(data: any) {
        data[UIDataNameBreakPoints] = NewBreakPointsManagerData();
        return NewProcessorManagerData;
    }

    public RegisterServices(container: IServiceResolverFactory, mainData: IMainData) {
        this.container = container;
        ProcessorMethods.SetCommandManager(mainData.commandManager);
        container.AddWithConstructor<ProcessorManager>(ProcessorManager.ServiceName, () => new ProcessorManager(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
        container.AddWithConstructor<BreakPointsManager>(BreakPointsManager.ServiceName, () => new BreakPointsManager(mainData)).WithLifestyle(ServiceLifestyle.Singleton);

        // services
        container.AddWithConstructor<DebuggerService>(DebuggerService.ServiceName, () => new DebuggerService(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
    }

    public PreInit() {
        
    }

    public Init() {
        if (this.container == null) return;
        this.container.Resolve<ProcessorManager>(ProcessorManager.ServiceName);
    }

    public Start() {

    }

    public GetDependecies() {
        return [];
    }

    public GetUIDataName() {
        return UIDataNameProcessor;
    }

    public GetName() {
        return "ASMFun.Processor";
    }

    public GetMethods():any {
        return ProcessorMethods;
    }
}

