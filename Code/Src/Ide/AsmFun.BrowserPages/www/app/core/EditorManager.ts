// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IMainData } from "../data/MainData.js";
import { EditorData, IEditorFile, IEditorLine, IEditorBundle, CreateNewEditorLine, IEditorLabel, ResetLineProperties } from "../data/EditorData.js";
import { KeyboardKeyCommand, EditorCodeAssistCommand, CloseEditorCodeAssistCommand, EditorPasteCommand, EditorInsertTextCommand, EditorEnableCommand, EditorSelectFileCommand, EditorSwapOutputCommand, EditorReloadLineCommand } from "../data/commands/EditorCommands.js";
import { ICommandEvent } from "../framework/ICommandManager.js";
import { IAsmFunAppData } from "../data/AsmFunAppData.js";
import { SourceCodeManager } from "./SourceCodeManager.js";
import { CursorLogic } from "./CursorLogic.js";
import { EditorWriter } from "./EditorWriter.js";
import { ProjectSaveCommand } from "../data/commands/ProjectsCommands.js";
import { ServiceName } from "../serviceLoc/ServiceName.js";
import { CodeAssistPopupManager } from "./CodeAssistPopupManager.js";
import { ProjectManager } from "./ProjectManager.js";

export interface IEditorContext {
    editorData: EditorData;
    cursorLogic: CursorLogic;
    sourceCode?: IEditorBundle;
    currentLine?: IEditorLine;
    currentFile?: IEditorFile | null;
    requireSave: boolean;
    RedrawLine();
    RedrawLine2(line: IEditorLine);
    UpdateOpcode();
}



export class EditorManager implements IEditorContext {

    private LocalStorageName: string = ".EditorData";
   
    public cursorLogic: CursorLogic = new CursorLogic();
    public editorData: EditorData = new EditorData();
    public editorWriter: EditorWriter = new EditorWriter();
   
    public sourceCode?: IEditorBundle;
    public currentFile?: IEditorFile | null ;
    public currentLine?: IEditorLine;
    private myAppData: IAsmFunAppData;
    private mainData: IMainData;
    private sourceCodeManager: SourceCodeManager;
    private projectManager: ProjectManager;
    
    private isEnabled = true;
    private codeAssistIsOpen = false;
    public requireSave = false;

    constructor(mainData: IMainData) {
        var thiss = this;
        this.mainData = mainData;
        this.myAppData = mainData.appData;
        
        this.sourceCodeManager = mainData.container.Resolve<SourceCodeManager>(SourceCodeManager.ServiceName) ?? new SourceCodeManager(this.mainData);
        this.projectManager = mainData.container.Resolve<ProjectManager>(ProjectManager.ServiceName) ?? new ProjectManager(this.mainData);
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
    }

  
    public SelectFile(file: IEditorFile | null) {
        if (file == null) return;
        if (this.currentFile === file) return;
        this.sourceCode = this.mainData.sourceCode;

        // Store last cursor coordinates
        if (this.currentFile != null) {
            this.projectManager.ProjectSetProp(this.currentFile.data.fileName + this.LocalStorageName, { x: this.editorData.cursorX, y: this.editorData.cursorY });
            this.currentFile.lastCursorX = this.editorData.cursorX;
            this.currentFile.lastCursorY = this.editorData.cursorY;
            this.currentFile.isSelected = false;
        }
        if (file == null) {
            if (this.sourceCode == null || this.sourceCode.files == null || this.sourceCode.files.length === 0) return;
            file = this.sourceCode.files[0];
        }
        this.sourceCodeManager.SelectFile(file);
       
        this.currentFile = file;
        if (this.currentFile.lines != null)
            this.editorData.maxY = this.currentFile.lines.length;
        this.myAppData.selectedFile = file;
        
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

    public LoadFirstFile(force:boolean = false) {
        this.sourceCode = this.mainData.sourceCode;
        if (this.sourceCode != null && this.sourceCode.files != null && this.sourceCode.files.length > 0) {
            if (force || this.currentFile == null)
                this.SelectFile(this.sourceCode.files[0]);
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
                this.currentLine.indent = "";
                this.currentLine.data.sourceCode = opcode.code;
                this.currentLine.rawContent = this.currentLine.data.sourceCode;
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
        if (this.currentLine.opcode != null && this.mainData.sourceCode != null && this.currentLine.data != null) {
            console.log("Open label code assist");
            this.codeAssistIsOpen = true;
            var cursorPos = this.cursorLogic.GetRealPosition();
            var svc = this.mainData.container.Resolve<CodeAssistPopupManager>(CodeAssistPopupManager.ServiceName);
            if (svc != null && cursorPos != null)
                svc.OpenLabelSearch(cursorPos.x, cursorPos.y, this.currentLine);
            return;
        }

        // Open opcode popup
        if (this.mainData.sourceCode != null && this.currentLine.data != null) {
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
        return this.myAppData.codeAssistPopupData.isVisible;
    }
    private KeyPressed(keyCommand: KeyboardKeyCommand, evt: ICommandEvent) {
        if (!this.isEnabled) {
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
    }

    public RedrawLine() {
        if (this.currentLine == null) return;
        this.RedrawLine2(this.currentLine);
    }
    public RedrawLine2(line: IEditorLine) {
        if (this.sourceCode == null) return;
        ResetLineProperties(line);
        this.sourceCodeManager.ReInterpretLine(line.context, line);
        this.sourceCodeManager.UpdateLineHtml(line, this.sourceCode.labels);
        this.sourceCodeManager.RedrawErrorBar(<any>this.currentFile, line);
        
        if (this.currentLine == line) {
            this.cursorLogic.UpdateMaxX(this);
            this.UpdateOpcode();
        }
        // console.log("HTML:"+this.currentLine.sourceCodeHtml);
    }

    public UpdateOpcode() {
        if (this.currentLine == null) return;
        this.myAppData.currentOpcode = this.currentLine.opcode != null && this.currentLine.opcode !== undefined ?
            this.currentLine.opcode : { asmFunCode: '', code: '' };
    }

    public MoveCursor(x, y) {
        if (this.PopupIsOpen()) return;
        if (this.currentFile == null)
            this.LoadFirstFile();
        this.cursorLogic.MoveCursor(this, x, y);
    }

    public EscapeKey() {
        this.cursorLogic.Deselect();
        if (this.myAppData.codeAssistPopupData.isVisible)
            this.myAppData.codeAssistPopupData.isVisible = false;
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
        if (this.mainData.sourceCode == null) return;
        var macro = this.mainData.sourceCode.macros.find(x => x.name === name);
        if (macro == null) return;
        this.SelectFile(macro.file);
        var thiss = this;
        setTimeout(() => {
            if (macro == null) return;
            this.MoveCursor(thiss.editorData.cursorX, macro.lines[0].data.lineNumber-1);
        }, 10);
    }

    public NavigateToZone(name: string) {
        if (this.mainData.sourceCode == null) return;
        var label = this.mainData.sourceCode.labels.find(x => x.data.name === name);
        if (label == null || label.file == null) return;
        this.SelectFile(label.file);
        // this.MoveCursor(this.editorData.cursorX, label..lines[0].data.lineNumber);
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

    

    public static NewEmptyFile(): IEditorFile {
        return {
            isSelected: false,
            lastCursorX: 0,
            lastCursorY: 0,
            lines: [],
            data: {
                isBinary: false,
                isCodeFile: false,
                folder: "",
                fileName: "",
                fileNameFull: "",
                exists: false,
                lines: [],
                requireSave: false,
            },
            fileHtml:null
        }
    }


    public static ServiceName: ServiceName = { Name: "EditorManager" };
}
