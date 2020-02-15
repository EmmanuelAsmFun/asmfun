// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion


// Framework
import { CommandManager } from "./framework/CommandManager.js";
import { PopupManager } from "./framework/PopupManager.js";
import { ControlManager } from "./framework/ControlManager.js";
import { AsmFunEventManager } from "./framework/AsmFunEventManager.js";
import { ServiceResolverFactory } from "./framework/serviceLoc/ServiceManager.js";
import { IServiceResolverFactory } from "./framework/serviceLoc/IServiceResolver.js";

// Core
import { IAsmFunAppData} from "./features/player/data/AsmFunAppData.js";
import { MainScreenMethods } from "./ui/MainScreenMethods.js"
import { AlertMessages } from './ui/AlertMessages.js'

// Services

import * as MainScreenMethodsV2 from "./ui/MainScreenMethodsV2.js";
import { IFeatureFactory } from "./framework/IFeatureFactory.js";

import { AvatarFactory } from "./features/avatar/AvatarFactory.js";
import { ComputerFactory } from "./features/computer/ComputerFactory.js";
import { EditorFactory } from "./features/editor/EditorFactory.js";
import { FileManagerFactory } from "./features/fileManager/FileManagerFactory.js";
import { KeyboardFactory } from "./features/keyboard/KeyboardFactory.js";
import { MemoryFactory } from "./features/memory/MemoryFactory.js";
import { PainterFactory } from "./features/painter/PainterFactory.js";
import { PaletteFactory } from "./features/palette/PaletteFactory.js";
import { PlayerFactory } from "./features/player/PlayerFactory.js";
import { ProcessorFactory } from "./features/processor/ProcessorFactory.js";
import { ProjectFactory } from "./features/project/ProjectFactory.js";
import { SettingsFactory } from "./features/settings/SettingsFactory.js";
import { VideoFactory } from "./features/video/VideoFactory.js";
import { SourceCodeManager } from "./features/editor/SourceCodeManager.js";
import { IMainData } from "./framework/data/MainData.js";
import { ServiceLifestyle } from "./framework/serviceLoc/ServiceName.js";




var NewAsmFunAppData: IAsmFunAppData = {
    alertMessages: new AlertMessages(),
    compilation: {
        compilationIsValid: true,
        isVisible: false,
        compilerResult: "",
        compilerErrors: "",
        hasErrors: false,
    },

}

export class ServiceRegisterer {
    public myAppData: IAsmFunAppData;
    public myMainData: IMainData;
    public container: IServiceResolverFactory = new ServiceResolverFactory();
    public mainScreenMethods;
    private features: IFeatureFactory[] =[];

    constructor() {
        this.myAppData = NewAsmFunAppData;
        var data: IMainData = {
            appData: this.myAppData,
            ctrlKeyIsDown: false,
            commandManager: new CommandManager(),
            eventManager: new AsmFunEventManager(),
            controlManager: new ControlManager(),
            popupManager: new PopupManager(),
            sourceCode: SourceCodeManager.NewBundle(),
            container: this.container,
            GetUIData: (featureName: string) => this.GetUIData(featureName),
        };
        this.myMainData = data;
        // Todo: remove this one
        new MainScreenMethods(this.myMainData);
        this.AddFeatures();
        // Add UI datas
        this.AddUIDatas(data.appData);
        this.AddMethods();
    }

    public AddFeatures() {
        this.features.push(new AvatarFactory());
        this.features.push(new ComputerFactory());
        this.features.push(new EditorFactory());
        this.features.push(new FileManagerFactory());
        this.features.push(new KeyboardFactory());
        this.features.push(new MemoryFactory());
        this.features.push(new PainterFactory());
        this.features.push(new PaletteFactory());
        this.features.push(new PlayerFactory());
        this.features.push(new ProcessorFactory());
        this.features.push(new ProjectFactory());
        this.features.push(new SettingsFactory());
        this.features.push(new VideoFactory());
    }

    private AddUIDatas(appData:any) {
        for (var i = 0; i < this.features.length; i++) {
            var uiData = this.features[i].GetUIData(appData);
            if (uiData == null) continue;
            var uiVarName = this.features[i].GetUIDataName();
            appData[uiVarName] = uiData;
        }
    }

    private GetUIData(featureName: string): any {
        return (<any>this.myMainData.appData)[featureName];
    }

    private AddMethods() {
        // Merge methods
        var methods = {};
        for (var i = 0; i < this.features.length; i++) {
            var m = this.features[i].GetMethods();
            methods = { ...methods, ...m };
        }
        methods = { ...methods, ...MainScreenMethodsV2 };
        this.mainScreenMethods = methods;
    }

    public Register() {
        for (var i = 0; i < this.features.length; i++) {
            this.features[i].PreRegister();
        }
        this.RegisterFramework();
        
        for (var i = 0; i < this.features.length; i++) {
            var feature = this.features[i];
            console.log("Register " + feature.GetName());
            this.features[i].RegisterServices(this.container, this.myMainData);
        }
    }

    private RegisterFramework() {
        // framework
        this.container.AddInstance(CommandManager.ServiceName, this.myMainData.commandManager).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddInstance(AsmFunEventManager.ServiceName, this.myMainData.eventManager).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddInstance(ControlManager.ServiceName, this.myMainData.controlManager).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddInstance(PopupManager.ServiceName, this.myMainData.popupManager).WithLifestyle(ServiceLifestyle.Singleton);

    }

    public Init() {
        for (var i = 0; i < this.features.length; i++) {
            this.features[i].PreInit();
        }
        for (var i = 0; i < this.features.length; i++) {
            this.features[i].Init();
        }
    }

    public Start() {
        for (var i = 0; i < this.features.length; i++) {
            this.features[i].Start();
        }
    }
}
