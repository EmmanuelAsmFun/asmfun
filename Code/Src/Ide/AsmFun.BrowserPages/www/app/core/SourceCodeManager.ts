﻿// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { ISourceCodeBundle, ISourceCodeFile, ISourceCodeLabel, ISourceCodeLine, IProjectSettings } from '../data/ProjectData.js'
import { OpcodeManager } from './OpcodeManager.js';
import { CodeBlockContext } from './CodeBlockContext.js';
import { HtmlSourceCode } from './HtmlSourceCode.js';
import { AsmTools } from "../Tools.js"
import { IMainData } from "../data/MainData.js";
import { ProjectSaveCommand, ProjectLoadCommand } from "../data/commands/ProjectsCommands.js";
import { IErrorForStatusBar, IEditorBundle, IEditorFile, IEditorLine, CreateNewEditorLine, IEditorLabel, CreateNewFile, CreateNewBundle, CreateNewEditorLabel, ICodeBlockContext } 
        from '../data/EditorData.js';
import { ProjectService } from '../services/projectService.js';
import { NotifyIconName, NotifyIcon, ErrorIcon } from '../common/Enums.js';
import { AcmeInterpreter } from '../interpreters/AcmeInterpreter.js';
import { IInterpreter } from '../interpreters/IInterpreter.js';
import { ServiceName } from '../serviceLoc/ServiceName.js';
import { EditorManager } from './EditorManager.js';
import { ICompilationResult } from '../data/CompilationDatas.js';

export class SourceCodeManager {
  

    private projectService: ProjectService;
    private opcodeManager: OpcodeManager;
    private htmlSourceCode: HtmlSourceCode;
    private mainData: IMainData;
    private interpreter: IInterpreter;
    private lastProjectSettings?: IProjectSettings;


    constructor(mainData: IMainData) {
        var thiss = this;
        this.opcodeManager = mainData.container.Resolve<OpcodeManager>(OpcodeManager.ServiceName) ?? new OpcodeManager();
        this.htmlSourceCode = mainData.container.Resolve<HtmlSourceCode>(HtmlSourceCode.ServiceName) ?? new HtmlSourceCode(mainData);
        this.projectService = mainData.container.Resolve<ProjectService>(ProjectService.ServiceName) ?? new ProjectService();
        this.mainData = mainData;
        this.interpreter = mainData.container.Resolve<AcmeInterpreter>(AcmeInterpreter.ServiceName) ?? new AcmeInterpreter(mainData);
        this.mainData.commandManager.Subscribe(new ProjectSaveCommand().GetType(), this, x => thiss.SaveSourceCode((<ProjectSaveCommand>x).bundle));
        this.mainData.commandManager.Subscribe(new ProjectLoadCommand().GetType(), this, x => thiss.LoadSourceCode(() => { }));
    }

    public SelectFile(file?: IEditorFile) {
        this.RedrawErrorsBar(file);
        if (file != null && file.fileHtml != null) {
            var cont = document.getElementById("selectedFileContent");
            if (cont != null && cont.hasChildNodes()) {
                for (var child of (<any>cont).childNodes) 
                    child.remove();

                cont.appendChild(file.fileHtml);
            }
        }
       
    }

    public SaveSourceCode(bundle?: IEditorBundle) {
        var thiss = this;
        if (bundle == null) return;
        var scBundle = bundle.data;
        if (scBundle.files == null) return;
        for (var i = 0; i < bundle.files.length; i++) {
            var file = bundle.files[i];
            var scFile = scBundle.files[i];
            scFile.lines = [];
            for (var j = 0; j < file.lines.length; j++) {
                var line = file.lines[j];
                scFile.lines.push(line.data);
            }
        }
        this.projectService.Save(scBundle, (r) => {
            thiss.mainData.appData.alertMessages.Notify("Backup, Saved and Compiled", NotifyIcon.OK);
            //  reload sourcecode to reinterpret all labels
            thiss.LoadSourceCode(() => {});
        }, e => {
            thiss.mainData.appData.alertMessages.ShowError("Error on save", e, ErrorIcon.Exclamation);
        });
        
        return true;
    }

    private LoadSourceCode(doneMethod: () => void) {
        var thiss = this;
        this.projectService.GetSourceCode(s => {
            thiss.projectService.GetProjectSettings(r => { thiss.lastProjectSettings = r; }, e => { });
            thiss.InterpretSourceCode(s);
            var svc = this.mainData.container.Resolve<EditorManager>(EditorManager.ServiceName)
            if (svc != null)
                svc.LoadFirstFile();
            thiss.RedrawErrorsBar(thiss.mainData.appData.selectedFile);
            thiss.LoadCompiled(() => {});
            if (doneMethod != null)
                doneMethod();
        });
    }

    private LoadCompiled(doneMethod: () => void) {
        var thiss = this;
        this.projectService.LoadCompiled(s => {
            thiss.ParseCompilerResult(s);
             var bundle = this.MergeCompile(s.sourceCodeBundle);
             //thiss.interpretSourceCode(bundle.data);
            //thiss.redrawErrorsBar(thiss.mainData.appData.selectedFile);
            if (doneMethod != null)
                doneMethod();
        });
    }

    private ParseCompilerResult(c: ICompilationResult) {
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
                    if (this.lastProjectSettings != null && error.filePath != null)
                        error.filePath = error.filePath.replace(this.lastProjectSettings.folder, "");
                    var file = this.mainData.sourceCode?.files.find(x => x.data.fileName == error.fileName);
                    if (file != null) {
                        var line = file.lines.find(x => x.data.lineNumber == error.lineNumber);
                        if (line != null) {
                            line.hasError = true;
                            line.error = {
                                line: line,
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

    private MergeCompile(s: ISourceCodeBundle) {
        var bundle = this.mainData.sourceCode;
        if (bundle == null || bundle.files ==null) {
            this.mainData.sourceCode = this.InterpretSourceCode(s);
            return this.mainData.sourceCode;
        }

        if (s.files == null) return bundle;
        for (var i = 0; i < s.files.length; i++) {
            var fileCompiled = s.files[i];
            if (fileCompiled.lines == null) continue;
            var file = bundle.files.find(x => x.data.fileName == fileCompiled.fileName);
            if (file != null) {
                if (file.lines != null) {
                    for (var j = 0; j < file.lines.length; j++) {
                        var lineCompiled = fileCompiled.lines[j];
                        var line = file.lines[j];
                        if (line.data != null && lineCompiled != null)
                            line.data.resultMemoryAddress = lineCompiled.resultMemoryAddress;
                    }
                }
            }
            else 
                bundle.files.push(CreateNewFile(fileCompiled));
        }
        if (s.labels != null && bundle.labels != null) {
            for (var i = 0; i < s.labels.length; i++) {
                var lblCompiled = s.labels[i];
                var lbl = bundle.labels.find(x => x.data.name == lblCompiled.name);
                if (lbl != null)
                    lbl.data.address = lblCompiled.address;
            }
        }
        return bundle;
    }
  

    private InterpretSourceCode(s: ISourceCodeBundle): IEditorBundle
    {
        var editorBundle: IEditorBundle = CreateNewBundle(s);
        var labelsWithoutZones: IEditorLabel[] = [];
        this.mainData.appData.labelsWithoutZones = [];

        // Create root context
        var rootContext: ICodeBlockContext = new CodeBlockContext(this.mainData.appData, editorBundle);
         rootContext.name = "root";
         rootContext.isRoot = true;
         editorBundle.allContext.push(rootContext);
         if (s.files != null) {

            // Parse all lines
            for (var i = 0; i < s.files.length; i++) {
                var file = s.files[i];
                var editorFile: IEditorFile = CreateNewFile(file);
                editorBundle.files.push(editorFile);
                var context: ICodeBlockContext = rootContext.CreateChild(editorFile);
                context.isFile = true;
                context.name = editorFile.data.fileName;
                if (file.lines != null) {
                    for (var j = 0; j < file.lines.length; j++) {
                        var line = file.lines[j];
                        var editorLine: IEditorLine = CreateNewEditorLine(context, line, editorFile);
                        editorFile.lines.push(editorLine);
                        editorLine.hasError = false;
                        context = this.InterpretLine(context, editorLine, true);
                        context.AddLine(editorLine);
                    }
                }
            }

            // Parse all link to the labels, variables and macros
            for (var i = 0; i < editorBundle.allContext.length; i++) {
                var context = editorBundle.allContext[i];
                context.ParseLinksBetweenLines();
             }

             // Parse all lalels that are not zones
             for (var i = 0; i < editorBundle.labels.length; i++) {
                 var lbl = editorBundle.labels[i];
                 if (!lbl.isZone)
                     labelsWithoutZones.push(lbl);
             }

             
            // Convert to html
            for (var i = 0; i < editorBundle.files.length; i++) {
                var editorFile = editorBundle.files[i];
                //var rootHtml = this.htmlSourceCode.CreateSpanRoot();
                //editorFile.fileHtml = rootHtml;
                for (var j = 0; j < editorFile.lines.length; j++) {
                    var editorLine = editorFile.lines[j];
                    this.UpdateLineHtml(editorLine, editorBundle.labels);
                    //if (editorLine.codeHtml != null && editorLine.codeHtml.root !== undefined)
                    //    rootHtml.appendChild(editorLine.codeHtml.root);
                }
            }
        }

        // Parse all to the UI
       // this.mainData.appData.labelsWithoutZones = labelsWithoutZones;
        this.mainData.sourceCode = editorBundle;
        this.mainData.appData.scfiles = this.mainData.sourceCode.files;
        return editorBundle;
    }


    public RedrawErrorsBar(file?: IEditorFile) {
        var errors: IErrorForStatusBar[] = [];
        if (file == null) return;
        if (file.lines != null) {
            for (var j = 0; j < file.lines.length; j++) {
                var line = file.lines[j];
                if (line.hasError)
                    errors.push({
                        lineNumber: line.data.lineNumber,
                        className: 'error',
                        posY: (line.data.lineNumber) / (file.lines.length + 1 + 60) * 100 //  60 = 800px margin-bottom
                    });
              }
        }
        this.mainData.appData.errorsForStatusBar = errors;
    }

    public RedrawErrorBar(file: IEditorFile, line: IEditorLine) {
        if (file.lines == null) return;
        var errors: IErrorForStatusBar[] = this.mainData.appData.errorsForStatusBar;
        var found = errors.findIndex(x => x.lineNumber == line.data.lineNumber);
        if (line.hasError && found < 0)
            errors.push({
                lineNumber: line.data.lineNumber,
                className: 'error',
                posY: line.data.lineNumber / (file.lines.length + 1) * 100
            });
        else {
            if (found > -1)
                errors.splice(found, 1);
        }   
        this.mainData.appData.errorsForStatusBar = errors;
    }

    public UpdateLineHtml(line: IEditorLine, sLabels?: IEditorLabel[]) {
        
        var sc = this.htmlSourceCode.convertLineLogicToHtml(line);
        sc = this.htmlSourceCode.composeLineFinalizeHtml(line, sc);
        // parse the final line at the end to not make vue update on every change.
        line.sourceCodeHtml = sc.outerHTML;
        //if (line.codeHtml == null) {
        //    line.codeHtml = {
        //        code : sc
        //    }
        //} else 
        //    line.codeHtml.code = sc;
        //this.htmlSourceCode.CreateFullLine(line);
       
        
    }
   
    public ReInterpretLine(context: ICodeBlockContext, currentLine: IEditorLine) {
        this.InterpretLine(context, currentLine, false);
        context.ParseLinksBetweenLines();
    }

    public InterpretLine(context: ICodeBlockContext, line: IEditorLine, fullParse: boolean = true): ICodeBlockContext {
        return this.interpreter.InterpretLine(context, line, fullParse);
    }

    public TryGetOpcode(data: string) {
        return this.opcodeManager.tryGetOpcode(data);
    }

    public static NewBundle(): IEditorBundle {
        return CreateNewBundle({ files: [], labels: [], name: "", sourceFileName: "" });
    }

    public static ServiceName: ServiceName = { Name: "SourceCodeManager" };
}