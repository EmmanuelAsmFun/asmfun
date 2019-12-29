// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { EditorData, IEditorSelection } from "../data/EditorData";

export interface ICursorUI {
    Deselect();
    UpdateCursor(editorData: EditorData, withSmoothScoll: boolean) ;
    GetRealPosition();
    Hide();
    Show();
    GetSelection(): IEditorSelection | null;
    SetSelectionStart(x, y);
    SetSelectionEnd(x, y);
}

export class CursorUI implements ICursorUI{

    private lastX: number = 0;
    private lastY: number = 0;
    private cursorElement: HTMLElement = <any>document.getElementById("MyCursor");
    private mouseInfoElement: HTMLElement = <any>document.getElementById("mouseInfo");

    private UpdateElement() {
        this.cursorElement = <any>document.getElementById("MyCursor");
    }

    public UpdateCursor(editorData: EditorData, withSmoothScoll:boolean) {
        var pxPosX = editorData.cursorX * editorData.charWidth + editorData.screenXOffset;
        var pxPosY = editorData.cursorY * editorData.charHeight + editorData.screenYOffset;

        this.UpdateElement();
        this.cursorElement.style.left = pxPosX + "px";
        this.cursorElement.style.top = pxPosY + "px";
        if (withSmoothScoll)
            this.cursorElement.scrollIntoView({ behavior: "smooth", block: "nearest", });
        else
            this.cursorElement.scrollIntoView({ behavior: "auto", block: "nearest", });
        this.lastX = pxPosX;
        this.lastY = pxPosY;
        
        if (this.mouseInfoElement == null)
            this.mouseInfoElement = <any>document.getElementById("mouseInfo");
        
        this.mouseInfoElement.innerHTML = "Ln:" + (editorData.cursorY + 1) + " &nbsp Ch:" + (editorData.cursorX + 1);
       
    }

    public GetRealPosition() {
        return { x: this.lastX +113 + 154, y: this.lastY +20+33};
    }
    public GetRealPositionExcludeScroll() {
        var sourceCodeEl: HTMLElement = <any>document.getElementById("sourceCode");
        return { x: this.lastX + 113 + 154, y: this.lastY + 20 + 33 - sourceCodeEl.scrollTop };
    }

    public Hide() {
        this.cursorElement.style.display = -1000 + "px";
    }
    public Show() {
        this.cursorElement.style.left = this.lastX + "px";
    }

    public GetHtmlElementUnderCursor() {
        var realPos = this.GetRealPositionExcludeScroll();
        var htmlels = document.elementsFromPoint(realPos.x, realPos.y);
        if (htmlels.length > 0) 
            return htmlels[0];
        return null;
    }

    public GetSelection(): IEditorSelection | null {
        // todo: use this https://stackoverflow.com/questions/52240216/how-to-wrap-text-inside-multiple-nodes-with-a-html-tag
        var returnData: IEditorSelection = {
            endLine: 0, endOffset: 0, startLine: 0, startOffset: 0, reversed:false
        }
        if (<any>window.getSelection) {
            var selection: Selection = (<any>window).getSelection();
            if (selection.type === "None" || selection.type === "Caret") return null;
            console.log(selection);
            var startLineNode: any = (<any>selection).anchorNode;
            var endLineNode: Node | null = (<any>selection).extentNode;
            var startLineNumber: string | null = "";
            var endLineNumber = "";
            var startOffset = (<any>selection).baseOffset;
            var endOffset = (<any>selection).extentOffset;
            if (startLineNode != null) {
                if (startLineNode.parentNode != undefined) {
                    var attr = startLineNode.parentNode.attributes["data-ln"];
                    if (attr != null && attr.value != null)
                        startLineNumber = attr.value;
                    else {
                        if (startLineNode.parentNode?.parentNode != undefined) {
                            attr = startLineNode.parentNode.parentNode.attributes["data-ln"];
                            if (attr != null && attr.value != null)
                                startLineNumber = attr.value;
                        }
                        else {
                            debugger;
                        }
                    }
                }
                if (startLineNumber == null || startLineNumber == "") {
                    if (startLineNode.firstChild != undefined) {
                        var attr = startLineNode.firstChild.attributes["data-ln"];
                        if (attr != null && attr.value != null)
                            startLineNumber = attr.value;
                        else {
                            if (startLineNode.firstChild?.firstChild != undefined) {
                                attr = startLineNode.firstChild.firstChild.attributes["data-ln"];
                                if (attr != null && attr.value != null)
                                    startLineNumber = attr.value;
                            }
                        }
                    }
                }
                if (startLineNumber == null || startLineNumber == "") {
                    debugger;
                }
            }
            if (endLineNode != null && endLineNode.nodeType === 3) // 3 = #text
            {
                if (endLineNode.parentNode != undefined) {
                    endLineNumber = (<any>endLineNode.parentNode).getAttribute("data-ln");
                    if (endLineNumber == null)
                        if (endLineNode.parentNode.parentNode != undefined) {
                            endLineNumber = (<any>endLineNode.parentNode.parentNode).getAttribute("data-ln");
                        }
                }
            }
            if ((endLineNumber == null || endLineNumber == "") && endLineNode != null) {
                if (endLineNode.firstChild != undefined) {
                    var attr = (<any>endLineNode.firstChild).attributes["data-ln"];
                    if (attr != null && attr.value != null)
                        endLineNumber = attr.value;
                    else {
                        if (endLineNode.firstChild?.firstChild != undefined && (<any>endLineNode.firstChild.firstChild).attributes != null) {
                            attr = (<any>endLineNode.firstChild.firstChild).attributes["data-ln"];
                            if (attr != null && attr.value != null)
                                endLineNumber = attr.value;
                        }
                    }
                }
            }

            returnData.endLine = Number(endLineNumber);
            returnData.startLine = Number(startLineNumber);
            // check if we need to reverse start and end
            if (returnData.startLine > returnData.endLine) {
                returnData.startLine = returnData.endLine;
                returnData.endLine = Number(startLineNumber);
                returnData.endOffset = startOffset;
                returnData.startOffset = endOffset;
                returnData.reversed = true;
            } else {
                returnData.startOffset = startOffset;
                returnData.endOffset = endOffset;
                returnData.reversed = false;
            }
            if (returnData.startLine == returnData.endLine) {
                if (returnData.startOffset > returnData.endOffset) {
                    returnData.startOffset = endOffset;
                    returnData.endOffset = startOffset;
                    returnData.reversed = true;
                }
            }
        }
        console.log(returnData);
        return returnData;
    }
    public Deselect() {
        var w = <any>window;
        var d = <any>document;
        if (w.getSelection) { w.getSelection().removeAllRanges(); }
        else if (d.selection) { d.selection.empty(); }
        // get selection
        const selection = window.getSelection();
        if (selection == null) return;
        selection.removeAllRanges();
    }


    public SetSelectionStart(x: number, y: number,forceRecreateNew: boolean = false) {
        var lineHtml:any = document.getElementById("lineCode" +(y +1));
        if (lineHtml == null) return;
        var el = this.GetHtmlElementUnderCursor();
        if (el == null) return;

        // Get offset
        var offset = 0;
        var offsetObj = el.getAttribute("data-o");
        if (offsetObj != null)
            offset = Number(offsetObj);
        
        // get selection
        var range: Range | null = null;
        const selection = window.getSelection();
        if (selection == null) return;
        if (selection.rangeCount > 0) {
            if (forceRecreateNew)
                selection.removeAllRanges();
            else
                return;
        }
        // Create range
        range = document.createRange();
        selection.addRange(range);
       
        if (el.firstChild !== null)
            range.setStart(el.firstChild, x - offset);
        else
            range.setStart(el, 0);
        // range.setStart(el, 0);
    }

    public SetSelectionEnd(x: number, y: number) {
        var lineHtml = document.getElementById("lineCode" + (y + 1));
        if (lineHtml == null) return;
        var el = this.GetHtmlElementUnderCursor();
        if (el == null) return;
        var offset = 0;
        var offsetObj = el.getAttribute("data-o");
        if (offsetObj != null)
            offset = Number(offsetObj);
        var range: Range | null = null;
        // get selection
        const selection = window.getSelection();
        if (selection == null) return;
        if (selection.rangeCount == 0) 
            return;
       range = selection.getRangeAt(0);
        if (range == null) return;
        if (el.firstChild !==null)
            range.setEnd(el.firstChild, x - offset);
        else
            range.setEnd(el, 0);
    }
}