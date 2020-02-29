// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IEditorLine, IPropertyType, PropertyNumType }
    from '../data/EditorData.js';
import { IInterpreter } from './IInterpreter.js';
import { ICompilationResult, ICompilationError } from "../data/CompilationDatas.js";
import { CommonInterpreter } from './CommonInterpreter.js';
import { IMainData } from '../../../framework/data/MainData.js';
import { OpcodeManager } from '../OpcodeManager.js';
import { ServiceName } from '../../../framework/serviceLoc/ServiceName.js';
import { IInterpretLine } from '../data/InterpreterData.js';
import { InterpreterBlock } from './InterpreterBlock.js';
import { InterpreterLine } from './InterpreterLine.js';
import { InterpreterBundle } from './InterpreterBundle.js';

export class Cc65Interpreter implements IInterpreter {

    private commonInterpreter: CommonInterpreter;
    private opcodeManager: OpcodeManager;
    private mainData: IMainData;

    constructor(mainData: IMainData) {
        var thiss = this;
        this.opcodeManager = mainData.container.Resolve<OpcodeManager>(OpcodeManager.ServiceName) ?? new OpcodeManager();
        this.commonInterpreter = mainData.container.Resolve<CommonInterpreter>(CommonInterpreter.ServiceName) ?? new CommonInterpreter(mainData);
        this.commonInterpreter.Init({
            compilerDatachar: '.',
        });
        this.mainData = mainData;
    }
    public GetCompilerName() {
        return "Cc65";
    }

   
    public ConvertToPropertyType(propType: string, data: string): IPropertyType {
        return this.commonInterpreter.ConvertToPropertyType(propType, data);
    }

    
       
    public InterpretLineParts(bundle: InterpreterBundle, interpretLine: InterpreterLine) {
        interpretLine.GetLineParts();
        var numParts = interpretLine.NoSpaceParts.length;
        if (numParts === 0) return;
        //if (interpretLine.Text.indexOf("COLPORT") > -1) 
        //    debugger;
        // if (line.file.data.fileName == "levels.asm" && line.data.lineNumber == 1183) 
        //    debugger;
        var partIndex = interpretLine.TryFindOpcode();
        if (partIndex == 1)
            interpretLine.ParseLabel(0);         // Part 0 is a label
        if (!interpretLine.OpcodeFound) {
            // If only one part, it's a label.
           
            var wordDef = interpretLine.NoSpaceParts[0].Text;
            switch (wordDef) {
                case ".macro":
                    interpretLine.ParseMacro(1);
                    return;
                case ".endmacro": this.CloseCurrentBlock(interpretLine); return;
                case ".proc":
                    return;
                case ".endproc": this.CloseCurrentBlock(interpretLine); return;
                case ".if":
                case ".ifnblank":
                    return;
                case ".endif": this.CloseCurrentBlock(interpretLine); return;
                case ".segment":
                case ".debuginfo":
                case ".listbytes":
                case ".listbytes":
                case ".error":
                case ".match":
                case ".xmatch":
                case ".mid":
                case ".left":
                case ".right":
                case ".loword":
                case ".hiword":
                case ".lobyte":
                case ".hibyte":
                case ".blankbyte":
                case ".blank":
                case ".concat":
                case ".const":
                case ".ident":
                case ".ref":
                case ".referenced":
                case ".sizeof":
                case ".tcount":
                case ".strat":
                case ".string":
                case ".sprintf":
                case ".strlen":
                case ".res":
                case ".include": // include file
                    return;
            }
            if (numParts == 1 && interpretLine.NoSpaceParts[0].Text[0] !== "+") {
                interpretLine.ParseLabel(0);
                return;
            }
            // Is setter ?
            if (interpretLine.TryParseSetter()) return;
            

            if (numParts > 1) {
                var part2 = interpretLine.NoSpaceParts[1];
                if (interpretLine.TryParseLabelSetter()) return;

                if (wordDef[0] === ".") {
                    //interpretLine.ParseProperty(0);
                    //if (interpretLine.Property != null)
                    //    interpretLine.Property.Data = prop;
                    return;
                }
                if (numParts > 2) {
                    var part3 = interpretLine.NoSpaceParts[2];
                    if (part2.Text[0] === ".") {
                        interpretLine.ParsePropertyWithType(0);
                        //if (interpretLine.Property != null)
                        //    interpretLine.Property.Data = this.commonInterpreter.ConvertToProperty("", part2.Text, interpretLine.Text.split(';')[0].trim().substr(part3.Index))
                        return;
                    }
                }
            }
        } else {
            // opcode found
            if (interpretLine.NoSpaceParts.length == 2) {
                // Try get constant
                var constType = interpretLine.TryConstantValue(1);
                if (constType === 1) return;
                if (constType === 2) {
                    // potential reference to variable or zone
                    bundle.AddPotentialReference(interpretLine, interpretLine.NoSpaceParts[1]);
                    return;
                }

                var txt = interpretLine.NoSpaceParts[1].Text;
                var char1 = txt[0];
                if (char1 == "$" || char1 == "(" || char1 == "-" || char1 == "+") {

                }
                else {
                    // potential reference to variable or zone
                    bundle.AddPotentialReference(interpretLine, interpretLine.NoSpaceParts[1]);
                }
                return;
            }
            
        }
    //    //var codeIndex = lineWithoutComment.indexOf('{');
    //    //if (codeIndex > -1) {
    //    //    // Check if test
    //    //    var startDataIndex = lineWithoutComment.indexOf(this.cpChar + 'if');
    //    //    if (startDataIndex > -1)
    //    //        return line.context.CreateIfCodeBlock(line, lineWithoutComment.substring(3, codeIndex - 1));
    //    //    // Check else
    //    //    startDataIndex = lineWithoutComment.indexOf('else {');
    //    //    if (startDataIndex > -1)
    //    //        return line.context.CreateElseCodeBlock(line);
    //    //    // Check address
    //    //    startDataIndex = lineWithoutComment.indexOf(this.cpChar + 'addr');
    //    //    if (startDataIndex > -1)
    //    //        return line.context.CreateAddrCodeBlock(line, lineWithoutComment.substring(5, codeIndex - 1));
    //    //    // zone
    //    //    startDataIndex = lineWithoutComment.indexOf(this.cpChar + 'zn');
    //    //    if (startDataIndex > -1) {
    //    //        var name = this.GetName(4, lineWithoutComment);
    //    //        return line.context.CreateZone(line, name, false);
    //    //    }
    //    //    // for
    //    //    startDataIndex = lineWithoutComment.indexOf(this.cpChar + 'for');
    //    //    if (startDataIndex > -1) {
    //    //        var parameters: string[] = this.GetParameters(this.cpChar + "for", lineWithoutComment);
    //    //        return line.context.CreateForBlock(line, parameters);
    //    //    }
    //    //    return line.context.CreateCodeBlock(line, "Unkown");
    //    //}
    //    if (lineWithoutComment.length > 3) {
    //        var wordPartsT = lineWithoutComment.split(' ');
    //        var wordParts: string[] = [];
    //        for (var i = 0; i < wordPartsT.length; i++) {
    //            if (wordPartsT[i] != "")
    //                wordParts.push(wordPartsT[i]);
    //        }
    //        if (wordParts.length > 2) {
    //            // property setter : sdsdf .byte $2c
    //            var propName = wordParts[0];
    //            var propType = wordParts[1];
    //            var valuesString = lineWithoutComment.substring(lineWithoutComment.indexOf(propType) + propType.length + 1).trim();
    //            var property = this.commonInterpreter.ConvertToProperty(propName, propType, valuesString);
    //            line.context.AddSetter(line, property);
    //        }
    //    }
    //    return line.context;
    }

    private CloseCurrentBlock(interpretLine: InterpreterLine) {

    }

    public StringToNumber(data: string) {

    }

    //public postInterpretLineMethod(lineWithoutCommentNotrim: string, lineWithoutComment: string, line: IEditorLine): ICodeBlockContext | null {
    //    //if (line.data.lineNumber == 21) {
    //    //    debugger;
    //    //}
    //    //if (this.commonInterpreter.parseOpcode(lineWithoutCommentNotrim, line))
    //    //    return true;
    //    var parts = lineWithoutCommentNotrim.trim().split(' ');
    //    if (parts == null || parts.length == 0) return null;
    //    var firstWord = parts[0];
    //    line.context.AddPotentialReference(line, firstWord);
    //    return line.context;
    //}

    public GetCompilerResultErrors(c: ICompilationResult): ICompilationError[] {
        var results: ICompilationError[] = [];
        if (c.errorText == null) return results;
        var errors = c.errorText.split(/\n/);
        if (errors != null) {
            for (var i = 0; i < errors.length; i++) {
                var errortxt = errors[i];
                try {
                    // Example : ld65: Warning: C:\Program Files\CC65\Wincc65\cfg/c64.cfg(45): Segment 'STARTUP' does not exist
                    if (errortxt.trim() === "") continue;
                    var errorParts = errortxt.split(':');
                    if (errorParts.length < 4) {
                        continue;
                    }
                    var compilerName = errorParts.shift()?.trim();
                    var errorType = errorParts.shift()?.trim();
                    var filePart = errorParts.shift()?.trim();
                    if (filePart != null && filePart.length == 1)
                        filePart += ":"+errorParts.shift()?.trim();
                    var description = errorParts.join(':').trim();
                    var lineNumberEntries = filePart?.match(/\((.*?)\)/);
                    if (lineNumberEntries != null && filePart != null && lineNumberEntries.length > 0) {

                        var lineNumber = Number(lineNumberEntries[0].replace("(", "").replace(")", ""));
                        var filePart2 = filePart.replace(lineNumberEntries[0], "");
                        var folderParts = filePart2.replace(/\\/g, "/").split('/');
                        var fileName = folderParts[folderParts.length - 1];
                        var folder = filePart2.replace(fileName, "");
                        var error: ICompilationError = {
                            lineNumber: lineNumber,
                            error: errorType ?? "",
                            description: compilerName+": "+description,
                            fileName: fileName,
                            filePath: folder
                        };
                        results.push(error);
                    }
                } catch (e) {
                    console.error("could not parse error:" + errortxt, e)
                }
            }
        }
        return results;
    }

    public PreInsertFromCodeAssist(command: import("../commands/EditorCommands.js").EditorInsertTextCommand) {
        // The code assist wants to insert new text

    }

    public static ServiceName: ServiceName = { Name: "Cc65Interpreter" };
}