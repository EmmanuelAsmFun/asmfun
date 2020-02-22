// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IEditorLine, IPropertyData, PropertyNumType }
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

   
    public InterpretLineParts(bundle: InterpreterBundle,interpreterLine: InterpreterLine) {
        interpreterLine.GetLineParts();
    }

    public ConvertToProperty(name: string, propType: string, data: string): IPropertyData {
        return this.commonInterpreter.ConvertToProperty(name, propType, data);
    }

    
       
    //private InterpretCompilerLine(lineWithoutComment: string, lineWithoutCommentNotrim: string, line: IEditorLine): ICodeBlockContext {
    //    line.dataCode = lineWithoutCommentNotrim;
    //    line.isCompilerData = true;
    //    var parts = lineWithoutComment.split(' ');
    //    if (parts.length == 0) return line.context;
    //    var wordDef = parts[0];
    //    var secondWord = parts.length > 1 ? parts[1].trim() : "";
    //    //if (line.data.sourceCode.indexOf("LOAD_LEVEL_PARAM") > -1) {
    //    //    var test = name;
    //    //    debugger;
    //    //}
    //    //if (line.file.data.fileName == "levels.asm" && line.data.lineNumber == 1183) {
    //    //    debugger;
    //    //}
    //    switch (wordDef) {
    //        case ".macro":
    //            parts.shift();
    //            parts.shift();
    //            var restText = parts.join(' ');
    //            var parameters: string[] = this.commonInterpreter.GetParameters(name, restText);
    //            return line.context.CreateMacro(line, secondWord, parameters);
    //        case ".endmacro": return line.context.CloseCurrentBlock(line);
    //        case ".proc":
    //            line.preCode = ".proc ";
    //            line.dataCode = ""; //line.dataCode.replace(".proc ","");
    //            line.context.CreateZone(line, secondWord, false);
    //        case ".endproc": return line.context.CloseCurrentBlock(line);
    //        case ".if": return line.context.CreateIfCodeBlock(line, lineWithoutComment.substring(3, lineWithoutComment.length - 3));
    //        case ".endif": return line.context.CloseCurrentBlock(line);
    //        case ".segment": 
    //        case ".debuginfo": 
    //        case ".listbytes":
    //        case ".error":
    //        case ".res":
    //            return line.context;
    //    }
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
    //}




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

    public static ServiceName: ServiceName = { Name: "Cc65Interpreter" };
}