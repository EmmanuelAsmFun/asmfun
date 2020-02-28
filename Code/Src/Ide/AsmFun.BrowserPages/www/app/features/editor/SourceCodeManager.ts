// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { ISourceCodeBundle, IProjectSettings, ProjectCompilerTypes, IAddressDataBundle } from '../project/data/ProjectData.js'
import { OpcodeManager } from './OpcodeManager.js';
import { HtmlSourceCode } from './HtmlSourceCode.js';
import {
    IErrorForStatusBar, IEditorBundle, IEditorFile, IEditorLine, CreateNewEditorBundle,
    IEditorManagerData
} 
        from './data/EditorData.js';
import { NotifyIconName, NotifyIcon, ErrorIcon } from '../../common/Enums.js';
import { AcmeInterpreter } from './interpreters/AcmeInterpreter.js';
import { IInterpreter } from './interpreters/IInterpreter.js';
import { EditorManager } from './EditorManager.js';
import { ICompilationResult } from './data/CompilationDatas.js';
import { Cc65Interpreter } from './interpreters/Cc65Interpreter.js';
import { ProjectService } from '../project/services/ProjectService.js';
import { IMainData } from '../../framework/data/MainData.js';
import { ProjectSaveCommand, ProjectSettingsLoaded } from '../project/commands/ProjectsCommands.js';
import { ServiceName } from '../../framework/serviceLoc/ServiceName.js';
import { UIDataNameEditor } from './EditorFactory.js';
import { IInterpretLine } from './data/InterpreterData.js';
import { InterpreterBundle } from './interpreters/InterpreterBundle.js';

export class SourceCodeManager {
  
    private editorBundle: IEditorBundle | null = null;
    private projectService: ProjectService;
    private opcodeManager: OpcodeManager;
    private htmlSourceCode: HtmlSourceCode;
    private mainData: IMainData;
    public data: IEditorManagerData;
    private interpreter?: IInterpreter;
    private lastProjectSettings?: IProjectSettings;

    public Bundle: InterpreterBundle | null = null;


    constructor(mainData: IMainData) {
        var thiss = this;
        this.data = mainData.GetUIData(UIDataNameEditor);
        this.opcodeManager = mainData.container.Resolve<OpcodeManager>(OpcodeManager.ServiceName) ?? new OpcodeManager();
        this.htmlSourceCode = mainData.container.Resolve<HtmlSourceCode>(HtmlSourceCode.ServiceName) ?? new HtmlSourceCode(mainData);
        this.projectService = mainData.container.Resolve<ProjectService>(ProjectService.ServiceName) ?? new ProjectService(mainData);
        this.mainData = mainData;
        
        this.mainData.commandManager.Subscribe2(new ProjectSaveCommand(), this, x => thiss.SaveSourceCode());
        this.mainData.eventManager.Subscribe2(new ProjectSettingsLoaded(), this, x => thiss.ParseProjectSettings(x.projectSettings));

    }

    public SelectFile(file: IEditorFile | null) {
        this.RedrawErrorsBar(file);
        if (this.Bundle == null) return;
        this.Bundle.SelectFile(file);
    }

    private PrepareInterpreter() {
        var compilerType = this.lastProjectSettings?.configurations[0].compilerType;
        switch (compilerType) {
            case ProjectCompilerTypes.Cc65:
                this.interpreter = this.mainData.container.Resolve<AcmeInterpreter>(Cc65Interpreter.ServiceName) ?? new Cc65Interpreter(this.mainData);
                return this.interpreter;
            case ProjectCompilerTypes.ACME:
                this.interpreter = this.mainData.container.Resolve<AcmeInterpreter>(AcmeInterpreter.ServiceName) ?? new AcmeInterpreter(this.mainData);
                return this.interpreter;
            default:
                this.interpreter = this.mainData.container.Resolve<AcmeInterpreter>(AcmeInterpreter.ServiceName) ?? new AcmeInterpreter(this.mainData);
                return this.interpreter;
        }
    }

    public SaveSourceCode() {
        var thiss = this;
        var bundle = this.editorBundle;
        if (bundle == null) return;
        var scBundle = bundle.data;
        if (scBundle.files == null) return;
        for (var i = 0; i < bundle.files.length; i++) {
            var file = bundle.files[i];
            var scFile = scBundle.files[i];
            if (scFile != null) {
                scFile.lines = [];
                for (var j = 0; j < file.lines.length; j++) {
                    var line = file.lines[j];
                    scFile.lines.push(line.data);
                }
            }
        }
        this.projectService.Save(scBundle, (r) => {
            thiss.mainData.appData.alertMessages.Notify("Backup, Saved and Compiled", NotifyIcon.OK);
            //  reload sourcecode to reinterpret all labels
            thiss.LoadSourceCode();
        }, e => {
            thiss.mainData.appData.alertMessages.ShowError("Error on save", e, ErrorIcon.Exclamation);
        });
        
        return true;
    }
 
    private ParseProjectSettings(projectSettings: IProjectSettings | null) {
        if (projectSettings == null) return;
        this.lastProjectSettings = projectSettings;
        if (projectSettings.isProgramOnly) {
            this.RemoveAllSourceCode();
            return;
        }
        this.LoadSourceCode();
    }
    private RemoveAllSourceCode() {
        this.editorBundle = CreateNewEditorBundle({
            name: "prg",
            sourceFileName: "prg",
            files: [],
            labels: [],
        });
        this.data.Files = [];
        this.data.SelectedFile = null;
        this.data.currentOpcode = null;
        this.data.breakPoints = [];
    }

    private LoadSourceCode() {
        var thiss = this;
        this.projectService.GetSourceCode(s => {
            thiss.PrepareInterpreter();
            thiss.InterpretSourceCode(s);
            var svc = this.mainData.container.Resolve<EditorManager>(EditorManager.ServiceName)
            if (svc != null)
                svc.LoadFirstFile(true);
            if (thiss.data.SelectedFile != null && this.Bundle != null) {
                var editorFile = this.Bundle.Files[thiss.data.SelectedFile.Index].Data.File;
                thiss.RedrawErrorsBar(editorFile);
            }
            thiss.LoadCompiled(() => { });
        });
    }

    private LoadCompiled(doneMethod: () => void) {
        this.projectService.LoadCompiled(s => {
            this.ParseCompilerResult(s);
            this.MergeCompile(s.sourceCodeBundle);
            if (doneMethod != null)
                doneMethod();
        });
    }

    private ParseCompilerResult(c: ICompilationResult) {
        if (this.interpreter == null) this.interpreter = this.PrepareInterpreter();
        var txt = c.rawText;
        if (txt != null)
            txt = txt.replace(/(?:\r\n|\r|\n)/g,"<br/>");
        this.mainData.appData.compilation.compilerResult = txt;
        this.mainData.appData.compilation.compilerErrors = c.errorText;
        this.mainData.appData.compilation.hasErrors = c.hasErrors;

        if (c.hasErrors) {

            this.mainData.appData.compilation.isVisible = true;
            var errors = this.interpreter.GetCompilerResultErrors(c);
            if (errors != null) {
                for (var i = 0; i < errors.length; i++) {
                    var error = errors[i];
                    var file = this.editorBundle?.files.find(x => x.data.fileName == error.fileName);
                    if (file == null) {
                        if (this.lastProjectSettings != null && error.filePath != null)
                            error.filePath = error.filePath.replace(this.lastProjectSettings.folder, "").replace("..\\", "").replace("../", "");
                        var fileWithPath = error.filePath + error.fileName;
                        file = this.editorBundle?.files.find(x => x.data.fileName == fileWithPath);
                    }
                    if (file != null) {
                        var line = file.lines.find(x => x.data.lineNumber == error.lineNumber);
                        if (line != null) {
                            line.Ui.HasError = true;
                            line.Ui.Error = {
                                line: line.Ui,
                                message: error.error + " " + error.description,
                                isFromCompiler: true,
                                compilerName: this.interpreter.GetCompilerName()
                            }
                        }
                    }
                }
            }
            this.mainData.appData.compilation.errors = errors;
        }
        else {
            this.mainData.appData.compilation.errors = [];
        }
    }

    private MergeCompile(s: IAddressDataBundle) {
        if (s.files == null) return;
        if (this.Bundle == null) return;
        this.Bundle.ParseAddressData(s);
    }
  

    private InterpretSourceCode(s: ISourceCodeBundle): IEditorBundle
    {
        if (this.interpreter == null) this.interpreter = this.PrepareInterpreter();
        this.data.Bundle.Labels = { List: [], Search: "", SearchChanged: () => { } };
        this.data.Bundle.Macros = { List: [], Search: "", SearchChanged: () => { } };
        this.data.Bundle.Properties = { List: [], Search: "", SearchChanged: () => { } };
        this.data.Bundle.Zones = { List: [], Search: "", SearchChanged: () => { } }
        this.Bundle = InterpreterBundle.NewBundle( this.interpreter, this.htmlSourceCode, this.data.Bundle);
        this.editorBundle = this.Bundle.Interpret(s);

        // Parse all to the UI
        this.data.Files = this.Bundle.Ui.Files;
        return this.editorBundle;
    }

    public GetEditorBundle(): IEditorBundle | null {
        return this.editorBundle;
    }


    public RedrawLine(line: IEditorLine) {
        if (this.Bundle == null) return;
        this.Bundle.ReInterpret(line.file.Index, line.data.lineNumber, true);
    }
    public RedrawLineNumber(line: IEditorLine) {
        if (this.Bundle == null) return;
        this.Bundle.RedrawLineNumber(line.file.Index, line.data.lineNumber);
    }
    public CreateNewLine(fileIndex: number, lineNumber: number): IEditorLine {
        if (this.Bundle == null) return <any>null;
        return this.Bundle.CreateNewLine(fileIndex, lineNumber);
    }
    public RemoveLine(fileIndex: number, lineNumber: number, doRenumbering: boolean) {
        if (this.Bundle == null) return;
        return this.Bundle.RemoveLine(fileIndex, lineNumber, doRenumbering);
    }
    public RenumberLines(fileIndex: number, startIndex: number, length: number) {
        if (this.Bundle == null) return;
        return this.Bundle.RenumberLines(fileIndex, startIndex, length);
    }

    public RedrawErrorsBar(file: IEditorFile | null) {
        var errors: IErrorForStatusBar[] = [];
        if (file == null) return;
        if (file.lines != null) {
            for (var j = 0; j < file.lines.length; j++) {
                var line = file.lines[j];
                if (line.Ui.HasError)
                    errors.push({
                        lineNumber: line.data.lineNumber,
                        className: 'error',
                        posY: (line.data.lineNumber) / (file.lines.length + 1 + 60) * 100 //  60 = 800px margin-bottom
                    });
              }
        }
        this.data.errorsForStatusBar = errors;
    }

    public RedrawErrorBar(file: IEditorFile, line: IEditorLine) {
        if (file.lines == null) return;
        var errors: IErrorForStatusBar[] = this.data.errorsForStatusBar;
        var found = errors.findIndex(x => x.lineNumber == line.data.lineNumber);
        if (line.Ui.HasError && found < 0)
            errors.push({
                lineNumber: line.data.lineNumber,
                className: 'error',
                posY: line.data.lineNumber / (file.lines.length + 1) * 100
            });
        else {
            if (found > -1)
                errors.splice(found, 1);
        }   
        this.data.errorsForStatusBar = errors;
    }

    public TryGetOpcode(data: string) {
        return this.opcodeManager.tryGetOpcode(data);
    }

    public static ServiceName: ServiceName = { Name: "SourceCodeManager" };
}