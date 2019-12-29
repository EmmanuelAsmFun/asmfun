// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { EditorData, IEditorLine, IEditorFile } from "../data/EditorData.js";
import { ICursorUI, CursorUI } from "../ui/CursorUI.js";
import { ISourceCodeBundle, ISourceCodeFile, ISourceCodeLine, ISourceCodeLabel } from "../data/ProjectData.js";
import { IEditorContext } from "./EditorManager.js";




export class CursorLogic {
   

    private cursorUI: ICursorUI;

    constructor() {
        this.cursorUI = new CursorUI();
    }


    public MoveEnd(ctx: IEditorContext, shiftisDown: boolean): boolean {
        if (shiftisDown)
            this.SetSelectionStart(ctx, ctx.editorData.cursorX, ctx.editorData.cursorY);
        ctx.editorData.cursorX = ctx.editorData.maxX;
        this.UpdateCursor(ctx);
        if (shiftisDown)
            this.SetSelectionEnd(ctx, ctx.editorData.cursorX, ctx.editorData.cursorY);
        return false;
    }

    public MoveHome(ctx: IEditorContext, shiftisDown: boolean): boolean {
        if (shiftisDown) 
            this.SetSelectionStart(ctx, 0, ctx.editorData.cursorY);
        
        var prevC = ctx.editorData.cursorX;
        var newPos = 0;
        if (ctx.currentLine != null) {
            for (var i = 0; i < ctx.currentLine.data.sourceCode.length; i++) {
                if (ctx.currentLine.data.sourceCode[i] !== " ")
                    break;
                newPos++;
            }
        }
        if (ctx.editorData.cursorX === newPos)
            ctx.editorData.cursorX = 0;
        else
            ctx.editorData.cursorX = newPos;
        this.UpdateCursor(ctx);
        if (shiftisDown)
            this.SetSelectionEnd(ctx, prevC, ctx.editorData.cursorY);
        return false;
    }

    public MoveCursor(ctx: IEditorContext, x, y) {
        if (y > ctx.editorData.maxY) y = ctx.editorData.maxY;
        if (y < 0) y = 0;
        ctx.editorData.cursorY = y;
        this.UpdateLine(ctx);
        if (x > ctx.editorData.maxX) x = ctx.editorData.maxX;
        if (x < 0) x = 0;
        ctx.editorData.cursorX = x;
        ctx.editorData.cursorY = y;
        ctx.editorData.cursorWishedX = x;
        this.UpdateCursor(ctx);
       // ctx.RedrawLine();
    }

    public MoveUp(ctx: IEditorContext, ctrlIsDown: boolean, shiftisDown: boolean, rows: number = 1) {
        if (shiftisDown)
            this.SetSelectionStart(ctx, ctx.editorData.cursorX, ctx.editorData.cursorY);
        else
            this.Deselect();
        if (ctx.editorData.cursorY - rows  <= 0)
            rows = ctx.editorData.cursorY;
        ctx.editorData.cursorY -= rows;
        this.UpdateLine(ctx);
        this.EnsureCursorInRange(ctx);
        this.UpdateCursor(ctx);
        if (shiftisDown)
            this.SetSelectionEnd(ctx, ctx.editorData.cursorX, ctx.editorData.cursorY);
        return false;
    }

    public MoveDown(ctx: IEditorContext, ctrlIsDown: boolean, shiftisDown: boolean, rows: number = 1) {
        if (shiftisDown)
            this.SetSelectionStart(ctx, ctx.editorData.cursorX, ctx.editorData.cursorY);
        else
            this.Deselect();
        if (ctx.editorData.cursorY > ctx.editorData.maxY - rows -1)
            rows = ctx.editorData.maxY - ctx.editorData.cursorY-1;
        ctx.editorData.cursorY += rows;
        this.UpdateLine(ctx);
        this.EnsureCursorInRange(ctx);
        this.UpdateCursor(ctx);
        if (shiftisDown)
            this.SetSelectionEnd(ctx, ctx.editorData.cursorX, ctx.editorData.cursorY);
        return false;
    }

    public MoveLeft(ctx: IEditorContext, ctrlIsDown: boolean, shiftisDown: boolean, recurence: number = 0) {
        var factor = 1;
        var hasMovedNewLine = false;
        if (shiftisDown && recurence === 0)
            this.SetSelectionStart(ctx, ctx.editorData.cursorX, ctx.editorData.cursorY);
        else
            this.Deselect();
        if (ctrlIsDown && ctx.currentLine != null) {
            var match: RegExpExecArray | null = null;
            var prevText = ctx.currentLine.data.sourceCode.substr(0,ctx.editorData.cursorX);
            if (prevText !== "") {
                var re = /[a-zA-Z0-9_$#%;!"=]+/g;
                var results:number[] = [];
                while ((match = re.exec(prevText)) != null) 
                    results.push(match.index);
                if (results.length > 0)
                    factor = ctx.editorData.cursorX- results[results.length-1];
            }
            else {
                factor = 0;
            }
            if ((factor == 0 ) && recurence === 0) {
                // goto previous line
                var prevY = ctx.editorData.cursorY;
                ctx.editorData.cursorX = 0;
                ctx.editorData.cursorWishedX = 0;
                this.MoveUp(ctx, false, false);
                ctx.editorData.cursorX = ctx.editorData.maxX;
                if (prevY !== ctx.editorData.cursorY && prevText !== "") {
                    this.MoveLeft(ctx, ctrlIsDown, shiftisDown, recurence +1);
                    hasMovedNewLine = true;
                }
            }
        }
        if (!hasMovedNewLine) {
            var wantedX = ctx.editorData.cursorX - factor
            if (wantedX >= 0) {
                ctx.editorData.cursorX = wantedX;
                this.UpdateCursor(ctx);
            } else {
                ctx.editorData.cursorWishedX = 900;
                this.MoveUp(ctx, false, shiftisDown);
            }
        }
        if (shiftisDown && recurence === 0)
            this.SetSelectionEnd(ctx, ctx.editorData.cursorX, ctx.editorData.cursorY);

        return false;

    }

    public MoveRight(ctx: IEditorContext, ctrlIsDown: boolean, shiftisDown: boolean, recurence: number = 0) {
        var factor = 1;
        var hasMovedNewLine = false;
        if (shiftisDown && recurence === 0)
            this.SetSelectionStart(ctx, ctx.editorData.cursorX, ctx.editorData.cursorY);
        else
            this.Deselect();
        if (ctrlIsDown && ctx.currentLine != null) {
            var match: RegExpExecArray | null = null;
            var nextText = ctx.currentLine.data.sourceCode.substr(ctx.editorData.cursorX);
            if (nextText !== "") {
                var re = /[a-zA-Z0-9_$#%;!"=]+/g;
                // we need to find the next match, not the current
                match = re.exec(nextText);
                if (match?.index === 0)
                    match = re.exec(nextText);
                if (match)
                    factor = match.index;
            }
            else {
                factor = 0;
            }
            if ((!match || factor == 0) && recurence ===0) {
                // goto nextLine
                var prevY = ctx.editorData.cursorY;
                ctx.editorData.cursorX = 0;
                ctx.editorData.cursorWishedX = 0;
                this.MoveDown(ctx, false, false);
                if (prevY !== ctx.editorData.cursorY && nextText !== "") {
                    this.MoveRight(ctx, ctrlIsDown, shiftisDown, recurence +1);
                    hasMovedNewLine = true;
                }
            }
        }
        if (!hasMovedNewLine) {
            var wantedX = ctx.editorData.cursorX + factor
            if (wantedX > ctx.editorData.maxX) {
                ctx.editorData.cursorX = 0;
                ctx.editorData.cursorWishedX = 0;
                this.MoveDown(ctx, false, shiftisDown);
            }
            else {
                ctx.editorData.cursorX = wantedX;
                this.UpdateCursor(ctx);
            }
        }
        if (shiftisDown && recurence === 0) 
            this.SetSelectionEnd(ctx, ctx.editorData.cursorX, ctx.editorData.cursorY);
        
        return false;
    }
    public MoveToMaxX(ctx: IEditorContext) {
        ctx.editorData.cursorX = ctx.editorData.maxX;
        this.UpdateCursor(ctx);
    }

    public PageUp(ctx: IEditorContext) {
        this.MoveUp(ctx,false,false, 40);
        return false;
    }

    public PageDown(ctx: IEditorContext) {
        this.MoveDown(ctx,false,false, 40);
        return false;
    }

    public UpdateCursor(ctx: IEditorContext, withSmoothScoll: boolean = true) {
        //var lineText = "";
        //if (ctx.currentLine != null)
        //    lineText = ctx.currentLine.sourceCode.length + " \t" + ctx.currentLine.sourceCode;
        //console.log("CursorPos :" + ctx.editorData.cursorX + "x" + ctx.editorData.cursorY + "\t:maxX=" + ctx.editorData.maxX + ":" + ctx.editorData.cursorWishedX + "\t" + lineText + "\t");
        //var pxPosX = ctx.editorData.cursorX * ctx.editorData.charWidth + ctx.editorData.screenXOffset;
        //var pxPosY = ctx.editorData.cursorY * ctx.editorData.charHeight + ctx.editorData.screenYOffset;
        this.cursorUI.UpdateCursor(ctx.editorData, withSmoothScoll);
    }

    private EnsureCursorInRange(ctx: IEditorContext) {
        if (ctx.editorData.cursorX < ctx.editorData.maxX) {
            if (ctx.editorData.cursorWishedX > ctx.editorData.cursorX) {
                ctx.editorData.cursorX = ctx.editorData.cursorWishedX;
                if (ctx.editorData.cursorX > ctx.editorData.maxX)
                    ctx.editorData.cursorX = ctx.editorData.maxX;
            }
            return;
        }
        if (ctx.editorData.cursorX > ctx.editorData.cursorWishedX)
            ctx.editorData.cursorWishedX = ctx.editorData.cursorX;
        ctx.editorData.cursorX = ctx.editorData.maxX;
    }

    private UpdateLine(ctx: IEditorContext) {
        if (ctx.currentFile != null && ctx.currentFile.lines != null && ctx.currentFile.lines.length >= ctx.editorData.cursorY) {
            ctx.currentLine = ctx.currentFile.lines[ctx.editorData.cursorY];
            if (ctx.currentLine == null) return;
            ctx.editorData.maxX = ctx.currentLine.data.sourceCode.length;
            // var exactWidth = ctx.currentLine.sourceCode.length
            ctx.UpdateOpcode();
        }
    }

    public UpdateMaxX(ctx: IEditorContext) {
        if (ctx.currentLine == null) return;
        ctx.editorData.maxX = ctx.currentLine.data.sourceCode.length;
    }

    public GetRealPosition() {
        return this.cursorUI.GetRealPosition();
    }

    public ChangeEnabledState(ctx: IEditorContext,state: boolean) {
        if (!state)
            this.cursorUI.Hide();
        else {
            this.cursorUI.Show();
            this.UpdateCursor(ctx);
        }
    }
    public GetSelection() {
        return this.cursorUI.GetSelection();
    }
    public Deselect() {
        this.cursorUI.Deselect();
    }
    public SetSelectionStart(ctx: IEditorContext,x: number, y:number) {
        this.cursorUI.SetSelectionStart(x, y);
    }
    public SetSelectionEnd(ctx: IEditorContext,x: number, y: number) {
        this.cursorUI.SetSelectionEnd(x, y);
    }
   
}