// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IEditorFile, IEditorLine, IEditorBundle, ICodeBlockContext, CreateNewFile, IEditorLabel, CreateNewEditorLabel, IPropertyData, IEditorZone } from "../data/EditorData.js";
import { ISourceCodeLabel } from "../data/ProjectData.js";
import { AsmTools } from "../Tools.js";
import { IMainData } from "../data/MainData.js";
import { IAsmFunAppData } from "../data/AsmFunAppData.js";

export class CodeBlockContext implements ICodeBlockContext {

    public appData: IAsmFunAppData;
    public parent? : ICodeBlockContext;
    public file: IEditorFile;
    public children: ICodeBlockContext[];
    public lines: IEditorLine[];
    public setters: IEditorLine[] = [];
    public variables: IEditorLine[] = [];
    private potentialRefLines: IEditorLine[] = [];
    // private potentialMacroRefLines: IEditorLine[] = [];
    public name: string = "";
    public isMacro: boolean = false;
    public isZone: boolean = false;
    public isFile: boolean = false;
    public isRoot: boolean = false;
    public isIf: boolean = false;
    public isElse: boolean = false;
    public isAddr: boolean = false;
    public isFor: boolean = false;
    public isLocalZone: boolean = false;
    public isAnonymous: boolean = false;
    public bundle: IEditorBundle;
    public parameters?: string[];

    constructor(appData: IAsmFunAppData,bundle:IEditorBundle,file?:IEditorFile, parent?:ICodeBlockContext)
    {
        this.appData = appData;
        this.file = file != null? file:parent != null
            ? parent.file
            : CreateNewFile({exists:false,fileName:"",fileNameFull:"",folder:"",isBinary:false,isCodeFile:false,lines:[],requireSave:false})
        this.bundle = bundle;
        this.parent = parent;
        this.children = [];
        this.lines = [];
    }

    public CreateChild(file?:IEditorFile): ICodeBlockContext {
       var thiss = this;
        var child = new CodeBlockContext(this.appData,thiss.bundle, file != null? file: thiss.file,thiss);
       thiss.children.push(child);
       child.parent = this;
       thiss.bundle.allContext.push(child)
       return child;
    } 

    public Remove(context: ICodeBlockContext) {
        // move context of items to parent context
        for (var i = 0; i < this.lines.length; i++) {
            var line = this.lines[i];
            // if we are at the root, then the line will be deleted definively, so we set it to line.context at the end.
            line.context = this.parent != null? this.parent : line.context ;
        }
        var index = this.bundle.allContext.indexOf(context);
        if (index > -1) this.bundle.allContext.splice(index,1);
        if (context.parent != null){
            var indexP = context.parent.children.indexOf(context);
            if (indexP > -1) context.parent.children.splice(indexP,1);
        }
        if (context.isMacro) {
            var macroIndex = this.appData.macros.indexOf(context);
            if (macroIndex > -1) this.appData.macros.splice(macroIndex,1);
        }
    }

    public CreateZone(line: IEditorLine, name: string, isLocalZone: boolean): ICodeBlockContext {
        if (name == null || name === "") {
            return line.context;
        }
        var cleanName = name.replace(":", "");
     
        // check if it already exists
        var zone: IEditorZone | undefined = this.appData.zones.find(x => x.name === cleanName);
        if (zone == null || zone == undefined) {
            // Create new zone
            zone= {
                line: line,
                name: cleanName,
                isAnonymousZone: false,
                nameDirty: name,
                isLocalZone: isLocalZone,
            }
            var isNextAn = cleanName == "+" || cleanName.indexOf("++") > -1;
            var isPrevAn = cleanName == "-" || cleanName.indexOf("--") > -1;

            if (isNextAn || isPrevAn) {
                zone.isAnonymousZone = true;
            }
            this.appData.zones.push(zone);
            // create label
            var label = this.CreateNewLabel(line.file, line, cleanName, true);
            label.isZone = true;
            label.showValueInCode = false;
            line.labelZoneSource = label;
            line.zone = zone;
            console.log("Add zone:" + cleanName);
        } else {
            console.log("Update zone:" + cleanName);
            line.potentialLabel = cleanName;
            if (line.zone != null)
                line.zone.name = cleanName
            this.parseLabel(line);
            line.labelZoneSource = line.label;
        }
        line.isZone = true;
        return line.context;
    }

   

    public CreateIfCodeBlock(line: IEditorLine,compareData:string): ICodeBlockContext {
        var context = this.CreateCodeBlock(line, "If "+compareData);
        context.isIf = true;
        return context;
    }

    public CreateElseCodeBlock(line: IEditorLine): ICodeBlockContext {
        var context = this.CloseCurrentBlock(line);
        context = context.CreateCodeBlock(line, "ElseBlock");
        context.isElse = true;
        return context;
    }
    public CloseCurrentBlock(line: IEditorLine): ICodeBlockContext {
        if (this.parent != null)
            return this.parent;
        return this;
    }

    public CreateAddrCodeBlock(line: IEditorLine, name: string): ICodeBlockContext {
        var context = this.CreateCodeBlock(line, name);
        context.isAddr = true;
        return context;
    }

    public CreateCodeBlock(line: IEditorLine, name: string): ICodeBlockContext {
        var cleanName = name.replace(":", "");
        var codeBlockContext: ICodeBlockContext;
        codeBlockContext = this.CreateChild();
        codeBlockContext.name = cleanName;
        codeBlockContext.nameDirty = name;
        codeBlockContext.isMacro = true;
        line.context = codeBlockContext;
        //this.bundle.zones.push(macroContext);
        return codeBlockContext;
    }
    
    public CreateMacro(line: IEditorLine, nameDirty: string, parameters: string[]): ICodeBlockContext {
        var cleanName = nameDirty.replace(":", "");
        // if we where already in a macro, go back to the parent to create a new context
        var macroContext: ICodeBlockContext;
        // check if it already exists
        var macroContext = this.appData.macros.find(x => x.name === cleanName);
        
        if (macroContext == null) {
            // Create new macro
            if (line.context.isMacro && this.parent != null)
                macroContext = this.parent.CreateChild();
            else
                macroContext = this.CreateChild();
            macroContext.name = cleanName;
            macroContext.nameDirty = nameDirty;
            macroContext.isMacro = true;
            this.appData.macros.push(macroContext);
            console.log("Add macro:" + cleanName);
        }
        else {
            console.log("Update macro:" + cleanName);
        }
        macroContext.parameters = parameters;
        line.isMacro = true;
        line.macroSource = macroContext;
        line.context = macroContext;
        return macroContext;
    }

    public CreateForBlock(line: IEditorLine, parameters: string[]): ICodeBlockContext {
        // if we where already in a macro, go back to the parent to create a new context
        var context :ICodeBlockContext;
        context = this.CreateChild();
        context.name = "ForBlock";
        context.isFor = true;
        context.parameters = parameters;
        line.context = context;
        return context;
    }

    public AddPotentialReference(line: IEditorLine, referenceName: string){
       
        line.potentialLabel = referenceName;
        line.potentialMacro = referenceName;
        //this.potentialLabelRefLines.push(line);
        this.potentialRefLines.push(line);
    }


    public AddAddressSetter(line: IEditorLine, nameDirty: string, address: number) {
        if (nameDirty == null || nameDirty === "") {
            return line.context;
        }
        var name = nameDirty.replace(":", "");
        var hexValue = AsmTools.numToHex4(address);
        // check if it already exists
        var label = this.appData.labels.find(x => x.data.name === name);
        if (label == null) {
            // Create new label
            label = this.CreateNewLabel(line.file, line, name,false);
            label.data.value = 0;
            label.data.variableLength = 1;
            label.data.address = address;
            label.isVariable = true;
            label.labelhexValue = "00";
            label.showValueInCode = true;
            this.variables.push(line);
            this.appData.variables.push(label);
            this.setters.push(line);
            console.log("Add address setter:" + name + " \t" + hexValue + " (" + address + ")");
        } else {
            console.log("Update address setter:" + name + " \t" + hexValue + " (" + address + ")");
        }
        label.labelhexAddress = hexValue;
        line.isAddressSetter = true;
        line.labelVariableSource = label;
        line.labelHexValue = "00";
        line.label = label;
        
       
    }
    public AddSetter(line: IEditorLine, property: IPropertyData) {
        if (property.name == null || property.name === "") {
            return line.context;
        }
        var hexValue = "";
        if (property.dataLength > 0 && property.dataLength <= 4)
            hexValue = AsmTools.numToHex(property.defaultNumValue, property.dataLength);

        var label = this.appData.labels.find(x => x.data.name === name);
        if (label == null) {
            label = this.CreateNewLabel(line.file, line, property.name,false);
            label.isVariable = true;
            
            this.setters.push(line);
            this.appData.variables.push(label);
            console.log("Add setter:" + property.name + " = " + hexValue);
        } else {
            console.log("Update setter:" + property.name + " = " + hexValue);
        }
        label.property = property;
        label.data.value = property.defaultNumValue;
        label.data.variableLength = property.dataLength;
        label.labelhexValue = hexValue;
        line.property = property;
        line.labelVariableSource = label;
        line.labelHexValue = hexValue;
        line.label = label;
        line.isVariable = true;
    }

    public AddLine(line: IEditorLine) {
        // Check if it has already been added.
        if (this.lines.indexOf(line) > -1) return;
        this.lines.push(line);
        line.context = this;
    }

    public RemoveLine(line: IEditorLine) {
        if (line == null) {
            throw "Cannot delete a null line";
        }
        var lineIndex = this.lines.indexOf(line);
        if (lineIndex > -1) {
            this.lines.splice(lineIndex, 1);
        }
        else {
            // line not found, search in parent
            if (this.parent != null) {
                this.parent.RemoveLine(line);
            }
            return;
        }
        lineIndex = this.potentialRefLines.indexOf(line);
        if (lineIndex > -1) this.potentialRefLines.splice(lineIndex, 1);
        // remove from setters
        lineIndex = this.setters.indexOf(line);
        if (lineIndex > -1) this.setters.splice(lineIndex, 1);
        // remove from variables
        lineIndex = this.variables.indexOf(line);
        if (lineIndex > -1) this.variables.splice(lineIndex, 1);
        // remove zone
        if (line.isZone && line.zone !== null) {
            var zoneIndex = this.appData.zones.indexOf(line.zone);
            if (zoneIndex > -1) this.appData.zones.splice(zoneIndex, 1);
            line.zone = null;
        }
        // remove in label
        if (line.label != null) {
            lineIndex = line.label.lines.indexOf(line);
            if (lineIndex > -1) line.label.lines.splice(lineIndex, 1);
            lineIndex = this.appData.variables.indexOf(line.label);
            if (lineIndex > -1) this.appData.variables.splice(lineIndex, 1);
        }

        // remove in macro
        if (line.macro != null) {
            lineIndex = line.macro.lines.indexOf(line);
            if (lineIndex > -1) line.macro.lines.splice(lineIndex, 1);
        }

    }


    public ParseLinksBetweenLines() {
        if (this.potentialRefLines.length === 0) return;
        for (var i = 0; i < this.potentialRefLines.length; i++) {
            var line = this.potentialRefLines[i];
            // if (line.data.lineNumber === 177) {
            //    var test = line;
            //    debugger;
            //}

           
            this.parseMacro(line);
            if (line.macro != null) {
                line.linkToZone = false;
                line.potentialLabel = "";
                continue;
            }
            this.parseLabel(line);
            if (line.label != null) {
                line.linkToMacro = false;
                if (!line.label.isZone)
                    line.label.showValueInCode = true;
                line.potentialMacro = "";
                continue;
            }
            if (line.isDataTransfer)
                continue;
            if (line.context.isMacro) {
                // link to local variable?
                var variable;
                 if (line.context.parameters != null)
                    variable = line.context.parameters.find(x => x === line.potentialLabel);
                if (variable == null && line.context.parent != null && line.context.parent.parameters != null) 
                    variable = line.context.parent.parameters.find(x => x === line.potentialLabel);
                if (variable != null) {
                    line.linkToLocalVariable = variable;
                    continue;
                }
            }
            var codeOnly = line.data.sourceCode.trim();
            if (codeOnly != "") {
                // check if its a number
                if (parseInt(codeOnly) === NaN) {
                    // Not a number
                    line.hasError = true;
                    if (line.error == null || !line.error.isFromCompiler)
                        line.error = {
                            line: line,
                            message: "Don't know what you mean, or haven't implemented yet.",
                            isFromCompiler: false,
                            compilerName: "Emmanuel"
                        }
                }
            }
        }
    }

  
    //public ParseLinkToMacros() {
    //    if (this.potentialMacroRefLines.length === 0) return;
    //    for (var i = 0; i < this.potentialMacroRefLines.length; i++) {
    //        var line = this.potentialMacroRefLines[i];
    //        this.parseMacro(line);
    //    }
    //}

    private CreateNewLabel(file: IEditorFile, line: IEditorLine, name: string, isZone:boolean): IEditorLabel {
        const label = CreateNewEditorLabel({ name: name, address: 0, value: 0, variableLength: 1 }, file, line);
        label.isZone = isZone;
        this.appData.labels.push(label);
        if (this.appData.labels != null && !isZone) {
            var exists = this.appData.labels.find(x => x.data.name === name);
            if (exists == null )
                this.appData.labels.push(label);
        }
        return label;
    }

    private parseLabel(line: IEditorLine) {
        if (line.potentialLabel == null || line.potentialLabel.length < 1) 
            return;
        var label = this.appData.labels.find(x => x.data.name === line.potentialLabel)
        if (label == null) {
            if (line.zone != null && line.zone.isAnonymousZone) { 
                return;
            }
            return;
        }
        line.label = label;
        if (label.isVariable) {
            line.linkToVar = true;
        } else if (label.isZone) {
            line.linkToZone = true;
        }
        label.lines.push(line);
    }

    private parseMacro(line: IEditorLine) {
        if (line.potentialMacro == null || line.potentialMacro.length < 1) 
            return;
        //if (line.potentialMacro.indexOf("SYS_HEADER_0801") > -1) {
        //    var test = line;
        //    debugger;
        //}
        var macro = this.appData.macros.find(x => x.name === line.potentialMacro)
        if (macro == null) {
            //line.hasError = true;
            return;
        }
    
        line.macro = macro;
        line.linkToMacro = true;

    }

 
}