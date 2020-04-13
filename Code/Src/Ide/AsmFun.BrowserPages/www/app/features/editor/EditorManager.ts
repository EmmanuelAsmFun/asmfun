// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { EditorData, IEditorFile, IEditorLine, IEditorManagerData, IEditorSelection } from "./data/EditorData.js";
import {
    KeyboardKeyCommand, EditorCodeAssistCommand, CloseEditorCodeAssistCommand, EditorPasteCommand, EditorInsertTextCommand, EditorEnableCommand,
    EditorSelectFileCommand, EditorSwapOutputCommand, EditorReloadLineCommand, EditorScrollToLineCommand, EditorClearProjectCommand, EditorInsertVariableSetterCommand, SelectedLineChanged
} from "./commands/EditorCommands.js";
import { SourceCodeManager } from "./SourceCodeManager.js";
import { CursorLogic } from "./CursorLogic.js";
import { EditorWriter } from "./EditorWriter.js";
import { FindReplaceManager } from "./FindReplaceManager.js";
import { CodeAssistPopupManager } from "./CodeAssistPopupManager.js";
import { IMainData } from "../../framework/data/MainData.js";
import { ProjectManager } from "../project/ProjectManager.js";
import { ProjectSaveCommand } from "../project/commands/ProjectsCommands.js";
import { ICommandEvent } from "../../framework/ICommandManager.js";
import { ServiceName } from "../../framework/serviceLoc/ServiceName.js";
import { UIDataNameEditor } from "./EditorFactory.js";
import { IUILine } from "./ui/IUILine.js";
import { IUIFile } from "./ui/IUIFile.js";
import { IInterpretLine } from "./data/InterpreterData.js";
import { FindReplaceOpenManagerCommand, FindReplaceSearchNextCommand } from "./commands/FindReplaceCommands.js";
import { SourceCodeLoadedAndParsed } from "./commands/SourceCodeCommands.js";

export interface IEditorContext {
    SelectLine(previousLine: IEditorLine);
    RenumberLines(fileIndex: number, startIndex: number, length: number);
    CreateNewLine(fileIndex: number, lineNumber: number): IEditorLine;
    RemoveLine(fileIndex: number, lineNumber: number, doRenumbering:boolean);
    editorData: EditorData;
    cursorLogic: CursorLogic;
    currentLine: IEditorLine | null;
    currentFile: IEditorFile | null;
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
    
    public currentFile: IEditorFile | null = null;
    public currentLine: IEditorLine | null = null;
    private currentLineI: IInterpretLine | null = null;

    private mainData: IMainData;
    private sourceCodeManager: SourceCodeManager;
    private projectManager: ProjectManager;
    private codeAssistPopupManager: CodeAssistPopupManager;
    private findReplaceManager: FindReplaceManager;
    
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
        this.findReplaceManager = mainData.container.Resolve<FindReplaceManager>(FindReplaceManager.ServiceName) ?? new FindReplaceManager(this.mainData);
        mainData.commandManager.Subscribe2(new KeyboardKeyCommand(), this, this.KeyPressed);
        mainData.commandManager.Subscribe2(new EditorCodeAssistCommand(), this, () => thiss.OpenCodeAssistent());
        mainData.commandManager.Subscribe2(new CloseEditorCodeAssistCommand(), this, () => thiss.CloseCodeAssistent());
        mainData.commandManager.Subscribe2(new EditorPasteCommand("",null), this, t => thiss.PasteText(t.text,t.selection));
        mainData.commandManager.Subscribe2(new EditorInsertTextCommand(), this, (c) => thiss.InsertTextFromCodeAssist(c.text, c.removeText));
        mainData.commandManager.Subscribe2(new ProjectSaveCommand(), this, () => { thiss.requireSave = false; });
        mainData.commandManager.Subscribe2(new EditorEnableCommand(null), this, (c) => thiss.SetEnableState(c.state));
        mainData.commandManager.Subscribe2(new EditorSelectFileCommand(null), this, (c) => thiss.SelectFileByUi(c.file));
        mainData.commandManager.Subscribe2(new EditorSwapOutputCommand(null), this, (c) => thiss.SwapOutputWindow(c.state));
        mainData.commandManager.Subscribe2(new EditorReloadLineCommand(null), this, (c) => { if (c.line != null) { thiss.RedrawLineFromUi(c.line); } });
        mainData.commandManager.Subscribe2(new EditorScrollToLineCommand(null), this, (c) => { if (c.line != null) { thiss.EditorScrollToLine(c.line); } });
        mainData.commandManager.Subscribe2(new EditorClearProjectCommand(), this, (c) => thiss.ClearProject());
        mainData.commandManager.Subscribe2(new EditorInsertVariableSetterCommand(null, null, null), this, (c) => thiss.EditorInsertVariableSetter(c.code, c.addressHex, c.name));
        // Events
        mainData.eventManager.Subscribe2(new SourceCodeLoadedAndParsed(), this, (c) => thiss.SourceCodeLoadedAndParsed());

    }


    public SelectFileByUi(file: IUIFile | null) {
        if (file == null) return;
        this.SelectFileByIndex(file.Index);
    }
    public SelectFileByIndex(fileIndex: number) {
        if (this.data.Files == null) return;
        var sourceCode = this.sourceCodeManager.GetEditorBundle();
        if (sourceCode == null) return;
        var file = sourceCode.files[fileIndex];
        this.SelectFile(file);
    }
    public SelectFile(file: IEditorFile | null) {
        if (this.currentFile === file) return;
        var sourceCode = this.sourceCodeManager.GetEditorBundle();
        if (sourceCode == null) return;
        // Store last cursor coordinates
        if (this.currentFile != null) {
            this.projectManager.ProjectSetProp(this.currentFile.data.fileName + this.LocalStorageName, { x: this.editorData.cursorX, y: this.editorData.cursorY });
            this.currentFile.lastCursorX = this.editorData.cursorX;
            this.currentFile.lastCursorY = this.editorData.cursorY;
            this.currentFile.Ui.IsSelected = false;
        }
        if (file == null) {
            if (sourceCode.files == null || sourceCode.files.length === 0) return;
            file = sourceCode.files[0];
        }
        this.sourceCodeManager.SelectFile(file);
        this.findReplaceManager.SelectAndHiliteInFile(file.Index);

        this.currentFile = file;
        if (this.currentFile.lines != null)
            this.editorData.maxY = this.currentFile.lines.length;
        this.data.SelectedFile = file.Ui;
        this.currentFile.Ui.IsSelected = true;
        this.LoadLastFileCursorPosition();
        
    }

    private LoadLastFileCursorPosition() {
        if (this.currentFile == null) return;
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

        this.cursorLogic.UpdateCursor(this, false);
    }

    public LoadFirstFile(force: boolean = false) {
        var sourceCode = this.sourceCodeManager.GetEditorBundle();
        if (sourceCode != null && sourceCode.files != null && sourceCode.files.length > 0) {
            if (force || this.currentFile == null)
                this.SelectFile(sourceCode.files[0]);
        }
    }

    /** Event when the source code is completly loaded */
    private SourceCodeLoadedAndParsed(): void {
        // Select the current file again to ensure this file and line are from the new instance.
        if (this.sourceCodeManager.Bundle == null || this.currentFile == null || this.currentLine ==null) return;
        var fileIndex = this.currentFile.Index;
        var lineIndex = this.currentLine.Ui.LineNumber - 1;
        this.currentFile = null;
        this.currentLine = null;
        this.SelectFileByIndex(fileIndex);
        this.SelectLineByIndex(lineIndex);
    }


    //#region Code Assist
    private OpenCodeAssistent() {
        if (this.currentLineI == null || this.currentLine == null) return;
        var cursorPos = this.cursorLogic.GetRealPosition();
        var svc = this.mainData.container.Resolve<CodeAssistPopupManager>(CodeAssistPopupManager.ServiceName);
        if (svc == null || cursorPos == null) return;
        var trimmed = this.currentLine.data.sourceCode.trim();

        if (this.currentLineI.Opcode == null && this.currentLineI.Macro == null) {

            // Check if we try to parse an AsmFunCode
            if (trimmed.length > 2) {
                var opcode = this.sourceCodeManager.TryGetOpcode(trimmed.trim());
                if (opcode != null && opcode != undefined) {
                    // Todo : Fix here opcode
                    this.currentLine.opcode = opcode;
                    this.currentLine.data.sourceCode = opcode.code;
                    this.currentLine.dataCode = "";
                    this.currentLineI.Opcode = opcode;
                    this.currentLineI.Text = opcode.code;
                    this.RedrawLine();
                    this.cursorLogic.MoveToMaxX(this);
                    return;
                }
            }

            // Open opcode and macros popup
            this.codeAssistIsOpen = true;
            svc.OpenOpcodesAndMacros(cursorPos.x, cursorPos.y, this.currentLineI);
            return;
        }
        // labels and properties
        this.codeAssistIsOpen = true;
        svc.OpenLabelsAndProperties(cursorPos.x, cursorPos.y, this.currentLineI);
        return;
    }

    private CloseCodeAssistent() {
        this.codeAssistIsOpen = false;
    }

    private PopupIsOpen() {
        return this.codeAssistPopupManager.GetVisibility();
    }
    //#endregion Code Assist


    public SelectLineByIndex(index: number) {
        if (this.currentFile == null) return;
        this.SelectLine(this.currentFile.lines[index]);
    }
    public SelectLine(line: IEditorLine) {
        this.currentLine = line;
        if (this.sourceCodeManager.Bundle == null) return;
        this.currentLineI = this.sourceCodeManager.Bundle.GetLine(line);
        this.mainData.eventManager.InvokeEvent(new SelectedLineChanged(line));
    }

    private PasteText(text: string, selection: IEditorSelection | null) {
        if (!this.isEnabled) return;
        this.editorWriter.PasteText(this, text, selection);
        this.cursorLogic.FocusEditor();
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
            //switch (keyCommand.key) {
            //    case "F3":
            //        this.mainData.commandManager.InvokeCommand(new FindReplaceOpenManagerCommand(true));
            //        keyCommand.allowContinueEmit = false;
            //        break;
            //}
            if (keyCommand.ctrlKey) {
                switch (keyCommand.key) {
                    // undo
                    case "z":
                        keyCommand.allowContinueEmit = this.editorWriter.Undo(this);
                        return;
                   
                }
            }
        }

        // Check if we are typing
        allowContinueEmit = this.editorWriter.KeyPessed(this, allowContinueEmit, keyCommand);
        keyCommand.allowContinueEmit = allowContinueEmit;

        //if (this.currentLine != null)
        //    console.log(this.currentLine.data.sourceCode);
    }

    public RedrawLine() {
        if (this.currentLine == null) return;
        this.RedrawLine2(this.currentLine);
    }
    
    private RedrawLineFromUi(line: IUILine) {
        if (this.currentFile == null) return;
        this.RedrawLine2(this.currentFile.lines[line.LineNumber - 1]);
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

    public MoveCursor(x, y, smoothScolling: boolean) {
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


    private EditorScrollToLine(lineO: IEditorLine | IUILine | null) {
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

    public EditorInsertVariableSetter(code: string | null, addressHex: string | null, name: string | null): void {
        if (this.currentFile == null || this.currentLine == null || this.sourceCodeManager.Bundle == null || addressHex == null || code == null) return;
        // Check if it's already added.
        var searchAd = addressHex;
        if (searchAd.length < 5) searchAd = "0" + searchAd;
        var exists = this.sourceCodeManager.Bundle.PropertyManager.FindByHexAddress(searchAd);
        if (exists != null) return;
        exists = this.sourceCodeManager.Bundle.PropertyManager.Find(code);
        if (exists != null) return;
        var numSpacesStart = 28 - code.length;
        if (numSpacesStart <= 0)
            numSpacesStart = 1;
        var codeText = code + " ".repeat(numSpacesStart)+"= $" + addressHex;
        var codeText = codeText + "  ; " + name + "\r\n";
        this.editorWriter.PasteText(this, codeText, null);
        
    }

    /** Completly resets the project, when createing a new project. */
    public ClearProject() {
        this.currentFile = null;
        this.currentLine = null;
        this.currentLineI = null;
        this.sourceCodeManager.ClearProject();
    }



    public HasFiles() {
        return this.currentFile != null && this.sourceCodeManager.Bundle != null && this.sourceCodeManager.Bundle.Files.length > 0;
    }

    private APopupIsOpen() {
        this.ChangeEnabledState(false);
    }
    private APopupIsClosed() {
        this.ChangeEnabledState(true);
    }

    public static ServiceName: ServiceName = { Name: "EditorManager" };
}
