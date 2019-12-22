﻿// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { CommandManager } from "./framework/CommandManager.js";
import { EditorManager } from "./core/EditorManager.js";
import { SettingsManager } from "./core/SettingsManager.js";
import { IMainData } from "./data/MainData.js";
import { IAsmFunAppData, NewStackData, NewProgramData, NewProcessorData } from "./data/AsmFunAppData.js";
import { MainScreenMethods } from "./ui/MainScreenMethods.js"
import { AlertMessages } from './ui/AlertMessages.js'
import { CodeAssistPopupManager } from "./core/CodeAssistPopupManager.js";
import { AvatarManager } from "./core/AvatarManager.js";
import { ProjectManager } from "./core/ProjectManager.js";
import { MemoryManager } from "./core/memoryManager.js";
import { SourceCodeManager } from "./core/SourceCodeManager.js";
import { ComputerManager } from "./core/ComputerManager.js";
import { SpritesManager } from "./core/SpritesManager.js";
import { ASMFunPlayerManager } from "./core/ASMFunPlayerManager.js";
import { KeyboardManager } from "./core/KeyboardManager.js";
import { ServiceResolverFactory } from "./serviceLoc/ServiceManager.js";
import { ServiceLifestyle } from "./serviceLoc/ServiceName.js";
import { ProcessorManager } from "./core/ProcessorManager.js";
import { ProjectService } from "./services/projectService.js";
import { DebuggerService } from "./services/DebuggerService.js";
import { ComputerService } from "./services/ComputerService.js";
import { OpcodeManager } from "./core/OpcodeManager.js";
import { HtmlSourceCode } from "./core/HtmlSourceCode.js";
import { AcmeInterpreter } from "./interpreters/AcmeInterpreter.js";

var NewAsmFunAppData: IAsmFunAppData = {
    data6502: NewProcessorData,
    stack: NewStackData,
    labelsWithoutZones: [],
    dissasembly: NewProgramData,
    isShowDebugger: false,
    alertMessages: new AlertMessages(),
    errorsForStatusBar: [],
    currentOpcode: { code: '', asmFunCode: '', },
    codeAssistPopupData: CodeAssistPopupManager.NewData(),
    settings: SettingsManager.NewData(),
    avatar: AvatarManager.NewData(),
    projectManager: ProjectManager.NewData(),
    selectedFile: EditorManager.NewEmptyFile(),
    memoryViewer: MemoryManager.NewData(),
    computer: ComputerManager.NewData(),
    spritesManager: SpritesManager.NewData(),
    scfiles: [],
    ide: {
        serverNotConnected: false,
        hasConfirmedLicense: false,
    },
    compilation: {
        compilationIsValid: true,
        isVisible: false,
        compilerResult: "",
        compilerErrors: "",
        hasErrors: false,
    }
}

export class ServiceRegisterer {
    public myAppData: IAsmFunAppData;
    public myMainData: IMainData;
    public container: ServiceResolverFactory = new ServiceResolverFactory();
    public mainScreenMethods;
    

    constructor() {
        this.myAppData = NewAsmFunAppData;
        var data: IMainData = {
            appData: this.myAppData,
            ctrlKeyIsDown: false,
            commandManager: new CommandManager(),
            sourceCode: SourceCodeManager.NewBundle(),
            container: this.container,
        };
        this.mainScreenMethods = new MainScreenMethods(data);
        this.myMainData = data;
        
    }

    public Register() {

        // services linked to commands
        this.container.AddWithConstructor<SpritesManager>(SpritesManager.ServiceName,() => new SpritesManager(this.myMainData)).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<ComputerManager>(ComputerManager.ServiceName, () => new ComputerManager(this.myMainData)).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<ASMFunPlayerManager>(ASMFunPlayerManager.ServiceName, () => new ASMFunPlayerManager(this.myMainData)).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<SettingsManager>(SettingsManager.ServiceName, () => new SettingsManager(this.myMainData)).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<SourceCodeManager>(SourceCodeManager.ServiceName, () => new SourceCodeManager(this.myMainData)).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<ProjectManager>(ProjectManager.ServiceName, () => new ProjectManager(this.myMainData)).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<ProcessorManager>(ProcessorManager.ServiceName, () => new ProcessorManager(this.myMainData)).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<CodeAssistPopupManager>(CodeAssistPopupManager.ServiceName, () => new CodeAssistPopupManager(this.myMainData)).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<EditorManager>(EditorManager.ServiceName, () => new EditorManager(this.myMainData)).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<MemoryManager>(MemoryManager.ServiceName, () => new MemoryManager(this.myMainData)).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<AvatarManager>(AvatarManager.ServiceName, () => new AvatarManager(this.myMainData)).WithLifestyle(ServiceLifestyle.Singleton);
        // standalone
        this.container.AddWithConstructor<HtmlSourceCode>(HtmlSourceCode.ServiceName, () => new HtmlSourceCode(this.myMainData)).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<KeyboardManager>(KeyboardManager.ServiceName, () => new KeyboardManager(this.myMainData)).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<OpcodeManager>(OpcodeManager.ServiceName, () => new OpcodeManager()).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<AcmeInterpreter>(AcmeInterpreter.ServiceName, () => new AcmeInterpreter(this.myMainData)).WithLifestyle(ServiceLifestyle.Singleton);
        // Services
        this.container.AddWithConstructor<ProjectService>(ProjectService.ServiceName, () => new ProjectService()).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<DebuggerService>(DebuggerService.ServiceName, () => new DebuggerService()).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<ComputerService>(ComputerService.ServiceName, () => new ComputerService()).WithLifestyle(ServiceLifestyle.Singleton);
    }

    public Init() {
        this.container.Resolve<SourceCodeManager>(SourceCodeManager.ServiceName)
        this.container.Resolve<MemoryManager>(MemoryManager.ServiceName)
        this.container.Resolve<ProjectManager>(ProjectManager.ServiceName)
        this.container.Resolve<SpritesManager>(SpritesManager.ServiceName)
        this.container.Resolve<ComputerManager>(ComputerManager.ServiceName)
        this.container.Resolve<ProcessorManager>(ProcessorManager.ServiceName)
        this.container.Resolve<ASMFunPlayerManager>(ASMFunPlayerManager.ServiceName)
        this.container.Resolve<CodeAssistPopupManager>(CodeAssistPopupManager.ServiceName)
        this.container.Resolve<EditorManager>(EditorManager.ServiceName)
        this.container.Resolve<AvatarManager>(AvatarManager.ServiceName)
        this.myAppData.settings = this.container.Resolve<SettingsManager>(SettingsManager.ServiceName)?.settings ?? SettingsManager.NewData();
    }
}
