﻿// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { EditorData, IEditorFile, IEditorLine, IEditorBundle, CreateNewEditorLine, IEditorLabel, ResetLineProperties, IEditorManagerData } from "./data/EditorData.js";
import {
    KeyboardKeyCommand, EditorCodeAssistCommand, CloseEditorCodeAssistCommand, EditorPasteCommand, EditorInsertTextCommand, EditorEnableCommand,
    EditorSelectFileCommand, EditorSwapOutputCommand, EditorReloadLineCommand, EditorScrollToLineCommand
} from "./commands/EditorCommands.js";
import { SourceCodeManager } from "./SourceCodeManager.js";
import { CursorLogic } from "./CursorLogic.js";
import { EditorWriter } from "./EditorWriter.js";
import { CodeAssistPopupManager } from "./CodeAssistPopupManager.js";
import { IMainData } from "../../framework/data/MainData.js";
import { ProjectManager } from "../project/ProjectManager.js";
import { ProjectSaveCommand } from "../project/commands/ProjectsCommands.js";
import { ICommandEvent } from "../../framework/ICommandManager.js";
import { ServiceName } from "../../framework/serviceLoc/ServiceName.js";
import { UIDataNameEditor } from "./EditorFactory.js";
import { IUILine } from "./ui/IUILine.js";

export interface IEditorContext {
    RenumberLines(fileIndex: number, startIndex: number, length: number);
    CreateNewLine(fileIndex: number, lineNumber: number): IEditorLine;
    RemoveLine(fileIndex: number, lineNumber: number, doRenumbering:boolean);
    editorData: EditorData;
    cursorLogic: CursorLogic;
    currentLine?: IEditorLine;
    currentFile?: IEditorFile | null;
    requireSave: boolean;
    RedrawLine();
    RedrawLine2(line: IEditorLine);
    RedrawLineNumber(line: IEditorLine);
    UpdateOpcode();
}



export class EditorManager implements IEditorContext {
   
   

    private LocalStorageName: string = ".EditorData";
   
    public cursorLogic: CursorLogic = new CursorLogic();
    public editorWriter: EditorWriter = new EditorWriter();
    public editorData: EditorData = new EditorData();
    public data: IEditorManagerData;
    
   
    //public sourceCode?: IEditorBundle;
    public currentFile?: IEditorFile | null ;
    public currentLine?: IEditorLine;
    private mainData: IMainData;
    private sourceCodeManager: SourceCodeManager;
    private projectManager: ProjectManager;
    private codeAssistPopupManager: CodeAssistPopupManager;
    
    private isEnabled = true;
    private codeAssistIsOpen = false;
    public requireSave = false;

    constructor(mainData: IMainData) {
        var thiss = this;
        this.mainData = mainData;
        this.data = mainData.GetUIData(UIDataNameEditor);
       
        this.mainData.popupManager.SubscribeLayer(0, () => this.APopupIsOpen(), () => this.APopupIsClosed())
        this.sourceCodeManager = mainData.container.Resolve<SourceCodeManager>(SourceCodeManager.ServiceName) ?? new SourceCodeManager(this.mainData);
        this.projectManager = mainData.container.Resolve<ProjectManager>(ProjectManager.ServiceName) ?? new ProjectManager(this.mainData);
        this.codeAssistPopupManager = mainData.container.Resolve<CodeAssistPopupManager>(CodeAssistPopupManager.ServiceName) ?? new CodeAssistPopupManager(this.mainData);
        mainData.commandManager.Subscribe2(new KeyboardKeyCommand(), this, this.KeyPressed);
        mainData.commandManager.Subscribe2(new EditorCodeAssistCommand(), this, () => thiss.OpenCodeAssistent());
        mainData.commandManager.Subscribe2(new CloseEditorCodeAssistCommand(), this, () => thiss.CloseCodeAssistent());
        mainData.commandManager.Subscribe2(new EditorPasteCommand(""), this, t => thiss.editorWriter.PasteText(thiss,t.text));
        mainData.commandManager.Subscribe2(new EditorInsertTextCommand(), this, (c) => thiss.InsertTextFromCodeAssist(c.text, c.removeText));
        mainData.commandManager.Subscribe2(new ProjectSaveCommand(), this, () => { thiss.requireSave = false; });
        mainData.commandManager.Subscribe2(new EditorEnableCommand(null), this, (c) => thiss.SetEnableState(c.state));
        mainData.commandManager.Subscribe2(new EditorSelectFileCommand(null), this, (c) => thiss.SelectFile(c.file));
        mainData.commandManager.Subscribe2(new EditorSwapOutputCommand(null), this, (c) => thiss.SwapOutputWindow(c.state));
        mainData.commandManager.Subscribe2(new EditorReloadLineCommand(null), this, (c) => { if (c.line != null) { thiss.RedrawLine2(c.line); } });
        mainData.commandManager.Subscribe2(new EditorScrollToLineCommand(null), this, (c) => { if (c.line != null) { thiss.EditorScrollToLine(c.line); } });

    }

   
   
    public SelectFileByIndex(fileIndex: number) {
        if (this.data.scfiles == null) return;
        var file = this.data.scfiles[fileIndex];
        this.SelectFile(file);
    }
    public SelectFile(file: IEditorFile | null) {
        if (file == null) return;
        if (this.currentFile === file) return;
        var sourceCode = this.sourceCodeManager.GetEditorBundle();
        if (sourceCode == null) return;
        // Store last cursor coordinates
        if (this.currentFile != null) {
            this.projectManager.ProjectSetProp(this.currentFile.data.fileName + this.LocalStorageName, { x: this.editorData.cursorX, y: this.editorData.cursorY });
            this.currentFile.lastCursorX = this.editorData.cursorX;
            this.currentFile.lastCursorY = this.editorData.cursorY;
            this.currentFile.isSelected = false;
        }
        if (file == null) {
            if (sourceCode.files == null || sourceCode.files.length === 0) return;
            file = sourceCode.files[0];
        }
        this.sourceCodeManager.SelectFile(file);
       
        this.currentFile = file;
        if (this.currentFile.lines != null)
            this.editorData.maxY = this.currentFile.lines.length;
        this.data.selectedFile = file;
        
        if (this.currentFile.lastCursorX == 0 || this.currentFile.lastCursorX == null) this.currentFile.lastCursorX = 0;
        if (this.currentFile.lastCursorY == 0 || this.currentFile.lastCursorY == null) this.currentFile.lastCursorY = 0;
        var fileEditorData: { x: number, y: number } | null = this.projectManager.ProjectGetProp(this.currentFile.data.fileName + this.LocalStorageName);
        if (fileEditorData != null) {
            this.editorData.cursorX = fileEditorData.x;
            this.editorData.cursorY = fileEditorData.y;
        } else {
            this.editorData.cursorX = this.currentFile.lastCursorX;
            this.editorData.cursorY = this.currentFile.lastCursorY;
        }
        this.currentFile.isSelected = true;
        this.cursorLogic.UpdateCursor(this, false);
    }

    public LoadFirstFile(force: boolean = false) {
        var sourceCode = this.sourceCodeManager.GetEditorBundle();
        if (sourceCode != null && sourceCode.files != null && sourceCode.files.length > 0) {
            if (force || this.currentFile == null)
                this.SelectFile(sourceCode.files[0]);
        }
    }

    private OpenCodeAssistent() {
        if (this.currentLine == null) return;

        // Check if we try to parse an AsmFunCode
        var trimmed = this.currentLine.data.sourceCode.trim();
        if (trimmed.length > 2) {
            var opcode = this.sourceCodeManager.TryGetOpcode(trimmed.trim());
            if (opcode != null && opcode != undefined) {
                this.currentLine.opcode = opcode;
                this.currentLine.data.sourceCode = opcode.code;
                this.currentLine.dataCode = "";
                this.RedrawLine();
                this.cursorLogic.MoveToMaxX(this);
                return;
            }
        }
        
        // Macro search popup
        if (trimmed.length > 0 && trimmed[0] === "+") {
            this.codeAssistIsOpen = true;
            console.log("Open macro code assist");
            var cursorPos = this.cursorLogic.GetRealPosition();
            var svc = this.mainData.container.Resolve<CodeAssistPopupManager>(CodeAssistPopupManager.ServiceName);
            if (svc != null && cursorPos != null)
                svc.OpenMacroSearch(cursorPos.x, cursorPos.y, this.currentLine);
            return;
        }

        // Label search popup
        if (this.currentLine.opcode != null && this.currentLine.data != null) {
            console.log("Open label code assist");
            this.codeAssistIsOpen = true;
            var cursorPos = this.cursorLogic.GetRealPosition();
            var svc = this.mainData.container.Resolve<CodeAssistPopupManager>(CodeAssistPopupManager.ServiceName);
            if (svc != null && cursorPos != null)
                svc.OpenLabelSearch(cursorPos.x, cursorPos.y, this.currentLine);
            return;
        }

        // Open opcode popup
        if (this.currentLine.data != null) {
            console.log("Open opcode assist");
            this.codeAssistIsOpen = true;
            var cursorPos = this.cursorLogic.GetRealPosition();
            var svc = this.mainData.container.Resolve<CodeAssistPopupManager>(CodeAssistPopupManager.ServiceName);
            if (svc != null && cursorPos != null)
                svc.OpenOpcodeSearch(cursorPos.x, cursorPos.y, this.currentLine);
            return;
        }
    }
    private CloseCodeAssistent() {
        this.codeAssistIsOpen = false;
    }

    private PopupIsOpen() {
        return this.codeAssistPopupManager.GetVisibility();
    }
    private KeyPressed(keyCommand: KeyboardKeyCommand, evt: ICommandEvent) {
        if (!this.isEnabled || !this.data.isTextEditorInFocus) {
            keyCommand.allowContinueEmit = true;
            return;
        }
        if (!keyCommand.allowContinueEmit) return;
        if (this.currentFile == null) {
            this.LoadFirstFile();
        }
        var allowContinueEmit = true;
        var theKey = keyCommand.key;

        // Code assist is not open
        if (!this.codeAssistIsOpen) {
            switch (keyCommand.which) {
                // Cursor
                case 33: allowContinueEmit = this.cursorLogic.PageUp(this); break;      // PageUp
                case 34: allowContinueEmit = this.cursorLogic.PageDown(this); break;    // PageDown
                case 37: allowContinueEmit = this.cursorLogic.MoveLeft(this, keyCommand.ctrlKey, keyCommand.shiftKey); break;    // Left
                case 38: allowContinueEmit = this.cursorLogic.MoveUp(this, keyCommand.ctrlKey, keyCommand.shiftKey); break;      // Up
                case 39: allowContinueEmit = this.cursorLogic.MoveRight(this, keyCommand.ctrlKey, keyCommand.shiftKey); break;   // Right
                case 40: allowContinueEmit = this.cursorLogic.MoveDown(this, keyCommand.ctrlKey, keyCommand.shiftKey); break;    // Down
                case 35: allowContinueEmit = this.cursorLogic.MoveEnd(this, keyCommand.shiftKey); break;     // End
                case 36: allowContinueEmit = this.cursorLogic.MoveHome(this, keyCommand.shiftKey); break;    // Home
                case 27: allowContinueEmit = this.EscapeKey(); break;                   // Escape
                 // Text edit
                case 13: allowContinueEmit = this.editorWriter.EnterKey(this); break;   // EnterKey
            }
        }
        if (keyCommand.ctrlKey) {
            if (keyCommand.key === "z") {// undo
                keyCommand.allowContinueEmit = this.editorWriter.Undo(this);
                return;
            }
        }

        // Check if we are typing
        allowContinueEmit = this.editorWriter.KeyPessed(this, allowContinueEmit, keyCommand);
        keyCommand.allowContinueEmit = allowContinueEmit;

        if (this.currentLine != null)
            console.log(this.currentLine.data.sourceCode);
    }

    public RedrawLine() {
        if (this.currentLine == null) return;
        this.RedrawLine2(this.currentLine);
    }
    
    public RedrawLine2(line: IEditorLine) {
        this.sourceCodeManager.RedrawLine(line);
        //ResetLineProperties(line);
        //this.sourceCodeManager.ReInterpretLine(line.context, line);
        //this.sourceCodeManager.UpdateLineHtml(line, this.data.labels);
        //this.sourceCodeManager.RedrawErrorBar(<any>this.currentFile, line);
        
        if (this.currentLine == line) {
            this.cursorLogic.UpdateMaxX(this);
            //this.UpdateOpcode();
        }
        // console.log("HTML:"+this.currentLine.sourceCodeHtml);
    }
    public RedrawLineNumber(line: IEditorLine) {
        this.sourceCodeManager.RedrawLineNumber(line);
    }

    public CreateNewLine(fileIndex: number, lineNumber: number): IEditorLine {
        if (this.sourceCodeManager == null) return <any>null;
        return this.sourceCodeManager.CreateNewLine(fileIndex, lineNumber);
    }
    public RemoveLine(fileIndex: number, lineNumber: number, doRenumbering: boolean) {
        if (this.sourceCodeManager == null) return;
        return this.sourceCodeManager.RemoveLine(fileIndex, lineNumber, doRenumbering);
    }
    public RenumberLines(fileIndex: number, startIndex: number, length: number) {
        if (this.sourceCodeManager == null) return;
        return this.sourceCodeManager.RenumberLines(fileIndex, startIndex, length);
    }

    public UpdateOpcode() {
        // still needed?
        //if (this.currentLine == null) return;
        //this.data.currentOpcode = this.currentLine.opcode != null && this.currentLine.opcode !== undefined ?
        //    this.currentLine.opcode : { asmFunCode: '', code: '' };
    }

    public MoveCursor(x, y, smoothScolling:boolean) {
        if (this.PopupIsOpen()) return;
        if (this.currentFile == null)
            this.LoadFirstFile();
        this.cursorLogic.MoveCursor(this, x, y, smoothScolling);
    }

    public EscapeKey() {
        this.cursorLogic.Deselect();
        this.codeAssistPopupManager.Close();
        return true;
    }

    public InsertTextFromCodeAssist(text?: string,textToRemove?:string) {
        if (this.currentLine == null || text == null) return;
        this.editorWriter.InsertTextFromCodeAssist(this, text, textToRemove);
        this.cursorLogic.UpdateCursor(this);
    }

    private SetEnableState(state: boolean | null) {
        if (state == null)
            state = !this.isEnabled;
        if (state == this.isEnabled) return;
        this.ChangeEnabledState(state);
    }

    private ChangeEnabledState(state: boolean) {
        this.isEnabled = state;
    }
    public GetIsEnabled() {
        return this.isEnabled;
    }

    public NavigateToMacro(name: string) {
        if (this.sourceCodeManager.Bundle == null) return;
        var macro = this.sourceCodeManager.Bundle.GetMacro(name);
        if (macro == null) return;
        this.SelectFileByIndex(macro.Ui.FileIndex);
        var thiss = this;
        setTimeout(() => {
            if (macro == null) return;
            this.MoveCursor(thiss.editorData.cursorX, macro.Line.LineNumber - 1, true);
        }, 10);
    }

    public NavigateToZone(name: string) {
        if (this.sourceCodeManager.Bundle == null) return;
        var label = this.sourceCodeManager.Bundle.GetLabel(name);
        if (label == null || label.Line == null) return;
        this.SelectFileByIndex(label.Ui.FileIndex);
        //setTimeout(() => {
        //    if (label == null) return;
        //    this.MoveCursor(this.editorData.cursorX, label.Line.LineNumber - 1, true);
        //}, 10);
    }

    private SwapOutputWindow(state: boolean | null) {
        if (state == null)
            state = !this.mainData.appData.compilation.isVisible;
        if (state === this.mainData.appData.compilation.isVisible) return;
        if (!state)
            this.CloseOutputWindow();
        else
            this.OpenOutputWindow();
    }

    private OpenOutputWindow() {
        this.mainData.appData.compilation.isVisible = true;
    }

    private CloseOutputWindow() {
        this.mainData.appData.compilation.isVisible = false;
    }


    public EditorScrollToLine(lineO: IEditorLine | IUILine | null) {
        if (lineO == null) return;
        if ((<any>lineO).LineNumber != undefined) {
            var lineI = <IUILine>lineO;
            this.SelectFileByIndex(lineI.FileIndex);
            this.MoveCursor(0, lineI.LineNumber - 1, true);
            return;
        }
        var line = <IEditorLine>lineO;
        if (line.data == null) return;
        this.SelectFile(line.file);
        this.MoveCursor(0, line.data.lineNumber - 1,true);
    }


    public HasFiles() {
        return this.data.selectedFile != null && this.data.selectedFile.lines.length === 0
    }
    

    private APopupIsOpen() {
        this.ChangeEnabledState(false);
    }
    private APopupIsClosed() {
        this.ChangeEnabledState(true);
    }

    private CleanSearch(str1: string) {
        return str1.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
    private CompareInsensitive(str2: string, str1: string) {
        return new RegExp(str1, "gi").test(str2);
    }

    public static ServiceName: ServiceName = { Name: "EditorManager" };
}
