
import { IFeatureFactory } from "../../framework/IFeatureFactory.js";
import * as EditorMethods from "./EditorMethods.js";
import { EditorManager } from "./EditorManager.js";

// Interpreters
import { AcmeInterpreter } from "./interpreters/AcmeInterpreter.js";
import { Cc65Interpreter } from "./interpreters/Cc65Interpreter.js";
import { CommonInterpreter } from "./interpreters/CommonInterpreter.js";
import { IServiceResolverFactory } from "../../framework/serviceLoc/IServiceResolver.js";
import { IMainData } from "../../framework/data/MainData.js";
import { ServiceLifestyle } from "../../framework/serviceLoc/ServiceName.js";
import { CodeAssistPopupManager } from "./CodeAssistPopupManager.js";
import { SourceCodeManager } from "./SourceCodeManager.js";
import { HtmlSourceCode } from "./HtmlSourceCode.js";
import { OpcodeManager } from "./OpcodeManager.js";
import { NewEditorManagerData } from "./data/EditorData.js";

export var UIDataNameEditor = "editor";
export var UIDataNameCodeAssist = "codeAssistPopupData";

export class EditorFactory implements IFeatureFactory{
   
    private container?: IServiceResolverFactory | null;

    public PreRegister() {}

    public GetUIData(data: any) {
        data[UIDataNameCodeAssist] = CodeAssistPopupManager.NewData();
        return NewEditorManagerData;
    }

    public RegisterServices(container: IServiceResolverFactory, mainData: IMainData) {
        this.container = container;
        EditorMethods.SetCommandManager(mainData.commandManager);
        container.AddWithConstructor<EditorManager>(EditorManager.ServiceName, () => new EditorManager(mainData)).WithLifestyle(ServiceLifestyle.Singleton);

        // standalone
        this.container.AddWithConstructor<CodeAssistPopupManager>(CodeAssistPopupManager.ServiceName, () => new CodeAssistPopupManager(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<SourceCodeManager>(SourceCodeManager.ServiceName, () => new SourceCodeManager(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<HtmlSourceCode>(HtmlSourceCode.ServiceName, () => new HtmlSourceCode(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<OpcodeManager>(OpcodeManager.ServiceName, () => new OpcodeManager()).WithLifestyle(ServiceLifestyle.Singleton);

        // Interpreters
        this.container.AddWithConstructor<CommonInterpreter>(CommonInterpreter.ServiceName, () => new CommonInterpreter(mainData)).WithLifestyle(ServiceLifestyle.Transient);
        this.container.AddWithConstructor<AcmeInterpreter>(AcmeInterpreter.ServiceName, () => new AcmeInterpreter(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<Cc65Interpreter>(Cc65Interpreter.ServiceName, () => new Cc65Interpreter(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
    }

    public PreInit() {
        
    }

    public Init() {
        if (this.container == null) return;
        this.container.Resolve<EditorManager>(EditorManager.ServiceName);
        this.container.Resolve<SourceCodeManager>(SourceCodeManager.ServiceName);
        this.container.Resolve<CodeAssistPopupManager>(CodeAssistPopupManager.ServiceName);
    }

    public Start() {

    }

    public GetDependecies() {
        return [];
    }

    public GetUIDataName() {
        return UIDataNameEditor;
    }

    public GetName() {
        return "ASMFun.Editor";
    }

    public GetMethods():any {
        return EditorMethods;
    }
}

