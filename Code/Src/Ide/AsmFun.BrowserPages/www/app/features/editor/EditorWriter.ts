﻿// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { EditorData, IEditorFile, IEditorLine, IEditorBundle, CreateNewEditorLine, IEditorLabel, IEditorSelection, IUndoData } from "./data/EditorData.js";
import { KeyboardKeyCommand, } from "./commands/EditorCommands.js";
import { IEditorContext } from "./EditorManager.js";


export class EditorWriter  {
  
    private static allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!<>&\"'(^!{})-_$*%+-:/;.,? \t=#@";
    private undos: IUndoData[] = [];
    private currentUndo: IUndoData | null = null;

    constructor() {
    }

    public KeyPessed(context: IEditorContext, allowContinueEmit: boolean, keyCommand: KeyboardKeyCommand): boolean {
        var theKey = keyCommand.key;
        var isTab = false;
        switch (keyCommand.which) {
            // Text edit
            case 8: allowContinueEmit = this.Backspace(context); break;    // Backspace
            case 46: allowContinueEmit = this.DeleteKey(context); break;   // DeleteKey
            case 9: theKey = "\t"; isTab = true; break;                                  // Tab
        }

        // Check if we are typing
        if (!keyCommand.ctrlKey && !keyCommand.altKey && allowContinueEmit) 
            allowContinueEmit = this.InterpretKey(context, theKey);
        // When it's tab, we need to move right one more time.
        if (isTab) context.cursorLogic.MoveRight(context,false,false);
        return allowContinueEmit;
    }

    public PasteText(context: IEditorContext,text: string) {
        if (text == null) return;

        for (var i = 0; i < text.length; i++) {
            var key = text[i];
            if (key == "\n")
                this.EnterKey(context, true);
            else 
                this.InterpretKey(context, text[i]);
        }
        this.RequireSave(context);
    }

    public InterpretKey(context:IEditorContext, theKey: string) {
        if (theKey !== "|") {
            if (EditorWriter.allowedChars.indexOf(theKey) < 0 && theKey !== "\t")
                return true;
        }
        if (context.currentLine == null || context.sourceCode == null) return true;
        var line = context.currentLine.data.sourceCode;
        if (context.editorData.cursorX <= line.length) {
            this.DeleteSelection(context);
            this.AddUndoChar(context.currentLine, theKey, context.editorData.cursorX, context.editorData.cursorY);
            context.currentLine.data.sourceCode = line.substring(0, context.editorData.cursorX) + theKey + line.substring(context.editorData.cursorX);
            context.RedrawLine();
            context.cursorLogic.MoveRight(context,false,false);
            this.RequireSave(context);
            return false;
        }
        return true;
    }

    private RequireSave(context: IEditorContext) {
        context.requireSave = true;
        if (context.currentFile != null)
            context.currentFile.data.requireSave = true;
    }
    


    public EnterKey(context: IEditorContext, isPaste: boolean = false): boolean {
        if (context.currentLine == null || context.currentFile == null || context.currentFile.lines == null) return false;
        this.DeleteSelection(context);
        var lineIndex = context.currentLine.data.lineNumber;
        var previousLine = context.currentLine;
        
        var newLine: IEditorLine = CreateNewEditorLine(context.currentLine.context, { sourceCode: "", resultMemoryAddress: "", lineNumber: 0 },
            context.currentFile);
        newLine.data.lineNumber = lineIndex + 1;
        context.currentFile.lines.splice(lineIndex, 0, newLine);
        // Set lineNumbers
        this.RenumberLines(context, lineIndex + 1, context.currentFile.lines.length);
        var textPartS = context.currentLine.data.sourceCode.substring(0, context.editorData.cursorX);
        var textPartE = context.currentLine.data.sourceCode.substring(context.editorData.cursorX);
        // when not pasting, insert the same amount of spaces as the currentline.
        var currentLineStartSpaces = "";
        var xNewPos = 0;
        if (!isPaste) {
            for (var i = 0; i < context.currentLine.data.sourceCode.length; i++) {
                if (context.currentLine.data.sourceCode[i] === " ") {
                    currentLineStartSpaces += " ";
                    xNewPos++;
                    continue;
                }
                break;
            }
        }

        context.currentLine.data.sourceCode = textPartS;
        context.RedrawLine();
        context.cursorLogic.MoveDown(context,false,false);
        context.currentLine.data.sourceCode = currentLineStartSpaces+textPartE;
        context.RedrawLine();
        if (xNewPos != 0) {
            context.editorData.cursorX = xNewPos;
            context.cursorLogic.UpdateCursor(context);
        }
        this.AddUndoEnter(previousLine, context.editorData.cursorX, context.editorData.cursorY);
        this.RequireSave(context);
        return false;
    }

    public Backspace(context: IEditorContext): boolean {

        if (context.currentLine == null || context.sourceCode == null || context.currentFile == null) return false;
        var line = context.currentLine.data.sourceCode;
        if (this.DeleteSelection(context)) return false;
        if (context.editorData.cursorX === 0) {
            if (context.editorData.cursorY > 1) {
                this.AddUndoBackspaceLine(context.currentLine, context.editorData.cursorX, context.editorData.cursorY);
                // Remove line
                var currentFile = (<any>context.currentFile);
                var previousLine: IEditorLine = currentFile.lines[context.currentLine.data.lineNumber - 2];
                context.editorData.cursorY--;
                context.editorData.cursorX = previousLine.data.sourceCode.length;
                previousLine.data.sourceCode += context.currentLine.data.sourceCode;
                context.currentLine.context.RemoveLine(context.currentLine);
                (<any>context.currentFile).lines.splice(context.currentLine.data.lineNumber - 1, 1);
                this.RenumberLines(context, context.currentLine.data.lineNumber - 1, currentFile.lines.length);
                context.currentLine = previousLine;
                context.RedrawLine();
                context.cursorLogic.UpdateCursor(context);
            }
        }
        else {
            this.AddUndoSameLine(context.currentLine, context.editorData.cursorX, context.editorData.cursorY);
            context.currentLine.data.sourceCode = line.substring(0, context.editorData.cursorX - 1) + line.substring(context.editorData.cursorX);
            context.RedrawLine();
            context.cursorLogic.MoveLeft(context,false,false);
            context.editorData.maxX--;
        }
        this.RequireSave(context);
        return false;
    }

    public DeleteKey(context: IEditorContext): boolean {
        if (this.DeleteSelection(context)) return false;
        if (context.editorData.maxX > 0 && context.editorData.cursorX > context.editorData.maxX - 1) return false;
        if (context.currentLine == null || context.sourceCode == null) return false;
       
        var line = context.currentLine.data.sourceCode;
        if (context.currentLine.data.sourceCode.length === 0) {
            var currentFile = (<any>context.currentFile);
            this.AddUndoDeleteKey(context.currentLine, context.editorData.cursorX, context.editorData.cursorY);
            // Delete next line, line numbers are index + 1
            context.currentLine.context.RemoveLine(currentFile.lines[context.currentLine.data.lineNumber]);
            (<any>context.currentFile).lines.splice(context.currentLine.data.lineNumber - 1, 1);
            this.RenumberLines(context, context.currentLine.data.lineNumber - 1, currentFile.lines.length);
            context.currentLine = currentFile.lines[context.currentLine.data.lineNumber - 1];
            if (context.currentLine != null && (<any>context.currentLine).sourceCode != null)
                context.editorData.maxX = (<any>context.currentLine).sourceCode.length;
        }
        else {
            this.AddUndoSameLine(context.currentLine, context.editorData.cursorX, context.editorData.cursorY);
            context.currentLine.data.sourceCode = line.substring(0, context.editorData.cursorX) + line.substring(context.editorData.cursorX + 1);
            context.editorData.maxX--;
        }

        context.RedrawLine();
        this.RequireSave(context);
        return false;
    }

    private DeleteSelection(context: IEditorContext): boolean {
        var selection = context.cursorLogic.GetSelection();
        if (selection == null) return false;
        var sameLine = selection.startLine == selection.endLine;
        if (selection.startLine > 0 && selection.endLine > 0) {
            if (sameLine)
                return this.DeleteSelectionSameLine(context, selection);
            else
                return this.DeleteSelectionMultiLine(context, selection);
        }
        return false;
    }

    private DeleteSelectionSameLine(context: IEditorContext, selection: IEditorSelection): boolean {
        if (context.currentFile == null || context.sourceCode == null) return false;
        var line = context.currentFile.lines[selection.startLine - 1];
        if (line == null) return false;
        this.AddUndoSameLine(line, context.editorData.cursorX, context.editorData.cursorY);
        line.data.sourceCode = line.data.sourceCode.substring(0, selection.startOffset) + line.data.sourceCode.substring(selection.endOffset);
        context.RedrawLine2(line);
        context.cursorLogic.Deselect();
        context.cursorLogic.MoveLeft(context,false,false);
        context.cursorLogic.MoveCursor(context, selection.startOffset, selection.startLine - 1);
        this.RequireSave(context);
        return true;
    }

    private DeleteSelectionMultiLine(context: IEditorContext, selection: IEditorSelection): boolean {
        
        if (context.currentFile == null || context.sourceCode == null) return false;
        var firstLine = context.currentFile.lines[selection.startLine - 1];
        var lastLine = context.currentFile.lines[selection.endLine - 1];
        if (firstLine == null || lastLine == null) return false;
        var toDelete = selection.endLine - selection.startLine;
        var x = selection.startOffset;
        var y = selection.startLine;
        var undoLineTexts:string[] = [];
        if (toDelete > 0) {
            // Get lines for undo
            for (var i = selection.startLine; i < selection.startLine + toDelete; i++) 
                undoLineTexts.push(context.currentFile.lines[i].data.sourceCode);

            // Delete the lines from the context.
            for (var i = selection.startLine + toDelete; i > selection.startLine; i--) {
                var theLine = context.currentFile.lines[i - 1];
                theLine.context.RemoveLine(theLine);
            }

            // Delete the lines from the source.
            var dels = (<any>context.currentFile).lines.splice(selection.startLine, toDelete);
            console.log("Deleted Lines", dels.map(x => x.data.sourceCode));

            // Renumber the next lines
            this.RenumberLines(context,selection.startLine, context.currentFile.lines.length);

        }
        this.AddUndoMultiLine(firstLine, undoLineTexts, x,y - 1);
        firstLine.data.sourceCode = firstLine.data.sourceCode.substring(0, selection.startOffset) + lastLine.data.sourceCode.substring(selection.endOffset);
        context.RedrawLine2(firstLine);
        context.cursorLogic.Deselect();
        context.cursorLogic.MoveCursor(context, selection.startOffset, selection.startLine - 1);
        this.RequireSave(context);
        return true;
    }

    private RenumberLines(context: IEditorContext, startIndex: number, length: number) {
        if (context.currentFile == null) return;
        for (var i = startIndex; i < length; i++) {
            context.currentFile.lines[i].data.lineNumber = i + 1;
            context.RedrawLineNumber(context.currentFile.lines[i]);
        }
    }

    public InsertTextFromCodeAssist(context: IEditorContext,text?: string, textToRemove?: string) {
        if (context.currentLine == null || text == null) return;
        this.AddUndoSameLine(context.currentLine, context.editorData.cursorX, context.editorData.cursorY);
        var sc = context.currentLine.data.sourceCode;
        // remove seach terms
        if (textToRemove != null)
            sc = sc.substring(0, sc.length - textToRemove.length);
        // insert space if needed
        if (sc[sc.length - 1] !== " ")
            sc += " "
        sc += text;
        context.currentLine.data.sourceCode = sc;
        context.RedrawLine2(context.currentLine);
        context.editorData.cursorX = context.currentLine.data.sourceCode.length;
        this.RequireSave(context);
    }




    private runningUndo = false;
    public Undo(context: IEditorContext): boolean {
        this.RequireSave(context);
        try {
            this.runningUndo = true;
            if (this.undos.length === 0) return false;
            var undo = this.undos[this.undos.length - 1];
            this.undos.pop();
            context.cursorLogic.MoveCursor(context, undo.x, undo.y);
            if (context.currentFile != null) {
                if (undo.isChars || undo.isSameLine) {
                    context.currentFile.lines[undo.y].data.sourceCode = undo.lineText;
                    context.RedrawLine();
                } else if (undo.isEnter) {
                    this.Backspace(context);
                } else if (undo.isBackspaceLine) {
                    this.EnterKey(context);
                    context.cursorLogic.MoveCursor(context, undo.x, undo.y);
                } if (undo.isDeleteKey) {
                    this.EnterKey(context);
                    context.cursorLogic.MoveCursor(context, undo.x, undo.y);
                } if (undo.isMultiLine) {
                    console.log("UndoFirstLine", undo.lineText);
                    context.currentFile.lines[undo.y].data.sourceCode = undo.lineText;
                    context.RedrawLine();
                    context.cursorLogic.MoveEnd(context, false);
                    console.log("UndoOtherLines", undo.addonLines);
                    for (var i = 0; i < undo.addonLines.length; i++) {
                        this.EnterKey(context);
                        if (context.currentLine != null) {
                            context.currentLine.data.sourceCode = undo.addonLines[i];
                            context.RedrawLine();
                            context.cursorLogic.MoveEnd(context, false);
                        }
                    }
                    // Renumber the next lines
                    this.RenumberLines(context, undo.y, context.currentFile.lines.length);
                }
            }
           
            return false;
        }
        finally {
            this.runningUndo = false;
        }
    }
    private AddUndoEnter(line: IEditorLine, x: number, y: number) {
        if (this.runningUndo) return;
        this.AddUndo(line, x, y);
        if (this.currentUndo != null) 
            this.currentUndo.isEnter = true;
    }
    private AddUndoBackspaceLine(line: IEditorLine, x: number, y: number) {
        if (this.runningUndo) return;
        this.AddUndo(line, x, y);
        if (this.currentUndo == null) return;
        this.currentUndo.isBackspaceLine = true;
    }
    private AddUndoDeleteKey(line: IEditorLine, x: number, y: number) {
        if (this.runningUndo) return;
        this.AddUndo(line, x, y);
        if (this.currentUndo == null) return;
        this.currentUndo.isDeleteKey = true;
    }
    private AddUndoSameLine(line: IEditorLine, x: number, y: number) {
        if (this.runningUndo) return;
        this.AddUndo(line, x, y);
        if (this.currentUndo == null) return;
        this.currentUndo.isSameLine = true;
    }
    private AddUndoMultiLine(line: IEditorLine, addonLines: string[], x: number, y: number) {
        if (this.runningUndo) return;
        this.AddUndo(line, x, y);
        if (this.currentUndo == null) return;
        this.currentUndo.isMultiLine = true;
        this.currentUndo.addonLines = addonLines;
    }
   
    private AddUndoChar(line: IEditorLine, char: string, x:number,y:number) {
        if (this.runningUndo) return;
        if (this.currentUndo == null) {
            this.AddUndo(line, x, y);
        } else {
            if (this.currentUndo.y !== y || !this.currentUndo.isChars)
                this.AddUndo(line, x, y);
        }
        if (this.currentUndo != null) {
            this.currentUndo.isChars = true;
            this.currentUndo.toInsertChars += char;
        }
    }
    private AddUndo(line: IEditorLine, x: number, y: number) {
        this.currentUndo = {
            lineText: line.data.sourceCode,
            toInsertChars: "",
            isChars: false,
            isEnter: false,
            isBackspaceLine:false,
            isSameLine: false,
            isMultiLine:false,
            isDeleteKey: false,
            addonLines:[],
            x: x,
            y: y,
        };
        this.undos.push(this.currentUndo);
        if (this.undos.length > 200)
            this.undos.shift();
    }
   
}