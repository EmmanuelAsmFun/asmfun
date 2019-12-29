// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { OpcodeManager } from './OpcodeManager.js';
import { IEditorLine } from '../data/EditorData.js';
import { IMainData } from '../data/MainData.js';
import { ServiceName } from '../serviceLoc/ServiceName.js';


export class HtmlSourceCode {

    private opcodeManager: OpcodeManager;
    container: any;

    constructor(mainData: IMainData) {
        this.opcodeManager = mainData.container.Resolve<OpcodeManager>(OpcodeManager.ServiceName) ?? new OpcodeManager();
        
    }

    public convertLineLogicToHtml(line: IEditorLine): HTMLElement {

        //if (line.data.lineNumber === 49) {
        //    var test = line;
        //    debugger;
        //}

        var writtenChars =0
        var lineRoot = this.CreateSpanRoot();
        if (line.preCode != null && line.preCode.length > 0) {
            this.CreateSpan(lineRoot, this.varToHtml(line.preCode), writtenChars);
            writtenChars += line.preCode.length;
        }

        if (line.indent != null && line.indent !== "") {
            this.CreateSpan(lineRoot, this.varToHtml(line.indent), writtenChars);
            writtenChars += line.indent.length;
        }
        
        if (line.isAddressSetter || line.isVariable)
            return this.CreateSetter(lineRoot, line, writtenChars);

        if (line.isSetRawData) 
            return this.CreateRawData(lineRoot, line, writtenChars);
        
        if (line.isZone) {
            writtenChars = this.CreateZone(lineRoot, line, writtenChars);
            if (line.indentAfterZone != "" && line.indentAfterZone != null) {
                this.CreateSpan(lineRoot, this.varToHtml(line.indentAfterZone), writtenChars);
                writtenChars += line.indentAfterZone.length;
            }
        }

        if (line.isMacro) 
            return this.CreateMacro(lineRoot, line, writtenChars);

        writtenChars = this.AddOpcode(lineRoot, line, writtenChars)

        // first labels
        if (line.label != null) 
            return this.CreateLinkToLabel(lineRoot, line, writtenChars);
           
        if (line.macro != null) 
            return this.CreateLinkToMacro(lineRoot, line, writtenChars);

        // a variable can be a label too, so after we check on Variable
        if (line.isFixValue) 
            return this.CreateFixValue(lineRoot, line, writtenChars);
        
        if (line.isCompilerData) 
            return this.CreateCompilerData(lineRoot, line, writtenChars);
        
        if (line.dataCode != null) 
            this.CreateSpan(lineRoot, this.varToHtml(line.dataCode), writtenChars)

        if (lineRoot.innerText === "" && (line.comment === "" || line.comment === undefined)) {
            line.data.sourceCode = " ";
            lineRoot.innerHTML = "&nbsp;";
        }
        return lineRoot;
    }

    public composeLineFinalizeHtml(line: IEditorLine, sc: HTMLElement): HTMLElement {
        var writtenChars = sc.innerText.length;
        // Add comments
        if (line.comment !== "" && line.comment != null) {
            var comment = this.CreateSpan(sc, this.varToHtml(line.comment), writtenChars);
            comment.className = "comm";
        }
        this.opcodeManager.InterpretOpcode(line);
        sc.setAttribute("data-ln", line.data.lineNumber.toString());
        sc.id = "lineCode" + line.data.lineNumber.toString();
        return sc;
    }
   

    private CreateZone(lineRoot: HTMLSpanElement, line: IEditorLine, writtenChars: number): number {
        if (line.labelZoneSource != null) {
            var labelHtml = this.CreateSpan(lineRoot, this.varToHtml(line.labelZoneSource.data.name), writtenChars);
            labelHtml.className = "zone";
            if (line.labelZoneSource != null && line.labelZoneSource.data.name != null)
                labelHtml.id = "z_" + line.labelZoneSource.data.name;
            return writtenChars + line.labelZoneSource.data.name.length;
        }
        return writtenChars;
    }

    private CreateMacro(lineRoot: HTMLSpanElement, line: IEditorLine, writtenChars: number): HTMLSpanElement {
        var labelHtml = this.CreateSpan(lineRoot, this.varToHtml(line.data.sourceCode), writtenChars);
        labelHtml.className = "macro";
        if (line.macro != null && line.macro.name != null) 
            labelHtml.id = "m_" + line.macro.name;
        return lineRoot;
    }

    private CreateSetter(lineRoot: HTMLSpanElement, line: IEditorLine, writtenChars:number): HTMLSpanElement {
        var labelHtml = this.CreateSpan(lineRoot, this.varToHtml(line.dataCode), writtenChars);
        labelHtml.className = "lbl";
        if (line.labelVariableSource != null) 
            labelHtml.id = "v_" + line.labelVariableSource.data.name;
        return lineRoot;
    }

    private CreateRawData(lineRoot: HTMLSpanElement, line: IEditorLine, writtenChars: number): HTMLSpanElement {
        return this.CreateSpan(lineRoot, this.varToHtml(line.dataCode), writtenChars);
    }

    private CreateLinkToLabel(lineRoot: HTMLSpanElement, line: IEditorLine, writtenChars: number) {
        var labelHtml = this.CreateSpan(lineRoot, this.varToHtml(line.dataCode), writtenChars);
        if (line.linkToZone) {
            labelHtml.className = "zonejp";
            labelHtml.setAttribute("onclick","jumpToZone(this, event, 'z_" + line.label?.data.name + "');");
        }
        else if (line.linkToVar) {
            labelHtml.className = "varjp";
            labelHtml.setAttribute("onclick","jumpToVar(this, event, 'v_" + line.label?.data.name + "');");
        }
        return lineRoot;
    }

    private CreateLinkToMacro(lineRoot: HTMLSpanElement, line: IEditorLine, writtenChars: number) {
        var macroHtml = this.CreateSpan(lineRoot, this.varToHtml(line.dataCode), writtenChars);
        if (line.linkToMacro) {
            macroHtml.className = "macrojp";
            macroHtml.setAttribute("onclick", "jumpToMacro(this, event, 'm_" + line.macro?.name + "');");
        }
        return lineRoot;
    }

    private AddOpcode(lineRoot: HTMLSpanElement, line: IEditorLine, writtenChars: number) {
        if (line.opcode != null && line.opcode !== undefined) {
            var htmlEl = this.CreateSpan(lineRoot, line.opcode.code, writtenChars);
            htmlEl.className = "opcode";
            return writtenChars + line.opcode.code.length;
        }
        return writtenChars;
    }

    private CreateFixValue(lineRoot: HTMLSpanElement, line: IEditorLine, writtenChars: number) {
        var dataHtml = this.CreateSpan(lineRoot, this.varToHtml(line.dataCode), writtenChars);
        dataHtml.className = "var";
        return lineRoot;
    }

    private CreateCompilerData(lineRoot: HTMLSpanElement, line: IEditorLine, writtenChars: number) {
        var dataHtml = this.CreateSpan(lineRoot, this.varToHtml(line.dataCode), writtenChars);
        dataHtml.className = "compset";
        return lineRoot;
    }

    public CreateSpan(lineRoot: HTMLElement, content: string, writtenChars: number) {
        var span = document.createElement("SPAN");
        span.innerHTML = content;
        if (writtenChars > 0)
            span.setAttribute("data-o", writtenChars.toString()) // 'o' from offset
        lineRoot.appendChild(span)
        return span;
    }
    public CreateSpan2(lineRoot: HTMLElement, content: HTMLElement,className: string) {
        var span = document.createElement("SPAN");
        span.className = className;
        span.appendChild(content);
        lineRoot.appendChild(span)
        return span;
    }


    public CreateSpanRoot() {
        return document.createElement("SPAN");;
    }

   

    private varToHtml(data: string):string {
        var res = data
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace(/ /g, "&nbsp;")
            ;
        return res;
    }

    public static ServiceName: ServiceName = { Name: "HtmlSourceCode" };

     //public CreateFullLine(line: IEditorLine) {
    //    if (line.codeHtml == null) return;
    //    var root = this.CreateSpanRoot();
    //    line.codeHtml.root = root;
    //    line.codeHtml.codeParent = this.CreateSpan2(root, line.codeHtml.code, "scline");
    //    //line.codeHtml.codeParent.setAttribute("onclick", "SourCodeLineClick(this,event,sourceCodeLine)");
    //    line.codeHtml.codeParent.appendChild(document.createElement("br"));
    //    line.codeHtml.asmFunCode = this.CreateSpan(root, line.asmFunCode != null? line.asmFunCode:"");
    //    //                    <span class="sc-l" v-if="isShowDebugger && sourceCodeLine.label != null && sourceCodeLine.label.showValueInCode">
    //    //                        <input v-bind:id="'labelEdit'+sourceCodeLine.data.lineNumber" v-if="sourceCodeLine.label != null && sourceCodeLine.label.isInEditMode"
    //    //                               type="text" v-model="sourceCodeLine.label.newValue" v-on:keydown="ChangeLabelValue(event,sourceCodeLine.label)" />
    //    //                        <span v-if="sourceCodeLine.label != null && !sourceCodeLine.label.isInEditMode === true"
    //    //                              v-on:click="SwapChangeLabelValue(sourceCodeLine)"> = {{ sourceCodeLine.label.labelhexValue}}</span>
    //    //                    </span>

    //    //                    <span class="ad" v-if="isShowDebugger">{{sourceCodeLine.data.resultMemoryAddress}}</span>
    //    //line.codeHtml.debugger = this.CreateSpan2(root, , "breakPoint");
    //    //                    <span class="breakPoint" v-if="isShowDebugger">
    //    //                        <a v-on:click="DbgSetBreakpointCurrentLine(selectedFile,sourceCodeLine)"
    //    //                           v-bind:class="{ 'debugable' :sourceCodeLine.resultMemoryAddress !=='', 'isBpSelected' : sourceCodeLine.hasBreakPoint }">
    //    //                            <span class="fa fa-circle"></span>
    //    //                        </a>
    //    //                    </span>
    //    //                    <span v-bind:id="'line'+sourceCodeLine.data.lineNumber" class="lnn" v-bind:title="'Address: ' + sourceCodeLine.data.resultMemoryAddress">
    //    //                        {{sourceCodeLine.data.lineNumber}}
    //    //                        <span class="errorDetail" v-if="sourceCodeLine.hasError && sourceCodeLine.error != null">{{avatar.entertainer.name}}: {{sourceCodeLine.error.message}}</span>
    //    //                    </span>
    //    this.UpdateLineState(line);
    //}

    //public UpdateLineState(line: IEditorLine) {
    //    if (line.codeHtml == null || line.codeHtml.root == null) return;
    //    line.codeHtml.root.className = "ln";
    //    if (line.selected) line.codeHtml.root.className += " isSelected";
    //    if (line.hasError) line.codeHtml.root.className += " hasError";
    //    if (line.hilite) line.codeHtml.root.className += " hilite";
    //}
}