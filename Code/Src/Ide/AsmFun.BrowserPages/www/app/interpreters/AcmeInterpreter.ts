// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { OpcodeManager } from '../core/OpcodeManager.js';
import { IMainData } from "../data/MainData.js";
import {IEditorLine, ICodeBlockContext, IPropertyData, PropertyNumType }
    from '../data/EditorData.js';
import { IInterpreter } from './IInterpreter.js';
import { AsmTools } from '../Tools.js';
import { ServiceName } from '../serviceLoc/ServiceName.js';
import { ICompilationResult, ICompilationError } from "../data/CompilationDatas.js";
import { CommonInterpreter } from './CommonInterpreter.js';


export class AcmeInterpreter implements IInterpreter{

    private commonInterpreter: CommonInterpreter;
    private opcodeManager: OpcodeManager;
    private mainData: IMainData;

    constructor(mainData: IMainData) {
        var thiss = this;
        this.opcodeManager = mainData.container.Resolve<OpcodeManager>(OpcodeManager.ServiceName) ?? new OpcodeManager();
        this.commonInterpreter = mainData.container.Resolve<CommonInterpreter>(CommonInterpreter.ServiceName) ?? new CommonInterpreter(mainData);
        this.mainData = mainData;
        this.commonInterpreter.Init({
            compilerDatachar: '!',
            postInterpretLineMethod: (a, b,c) => { return this.postInterpretLineMethod(a, b,c); },
        });
    }
    public GetCompilerName() {
        return "ACME";
    }

    public InterpretLine(context: ICodeBlockContext, line: IEditorLine, fullParse: boolean = true): ICodeBlockContext {
        this.commonInterpreter.InterpretLine(context, line, fullParse);
        return line.context;
    }
    public postInterpretLineMethod(lineWithoutCommentNotrim: string, lineWithoutComment:string, line: IEditorLine): ICodeBlockContext | null {
        // macro call
        var plusIndex = lineWithoutComment.indexOf('+')
        if (plusIndex > -1 && plusIndex < lineWithoutComment.length && lineWithoutComment[plusIndex + 1] != " ") {
            return this.commonInterpreter.InterpretMacroCall(line, lineWithoutComment.substring(plusIndex));
        }
        return null;
    }


    public GetCompilerResultErrors(c: ICompilationResult): ICompilationError[] {
        var results: ICompilationError[] = [];
        if (c.errorText == null) return results;
        var errors = c.errorText.split(/\n/);
        if (errors != null) {
            for (var i = 0; i < errors.length; i++) {
                var errortxt = errors[i];
                try {
                    if(errortxt.trim() === "") continue;
                    var firstWordIndex = errortxt.indexOf(' ');
                    var filePart = errortxt.substring(0, firstWordIndex);
                    var lineNumberEntries = filePart.match(/\((.*?)\)/);
                    if (lineNumberEntries != null && lineNumberEntries.length > 0) {

                        var lineNumber = Number(lineNumberEntries[0].replace("(", "").replace(")", ""));
                        var filePart = filePart.replace(lineNumberEntries[0], "");
                        var folderParts = filePart.replace(/\\/g, "/").split('/');
                        var fileName = folderParts[folderParts.length-1];
                        var folder = filePart.replace(fileName, "");
                        var lineErrorRest = errortxt.substring(firstWordIndex).trim();
                        var parts = lineErrorRest.split(':');
                        var errorKey = "";
                        if (parts.length > 0) errorKey = parts[1].trim();
                        var errorDescription = "";
                        if (parts.length > 1) errorDescription = parts[2].trim();
                        var error: ICompilationError = {
                            lineNumber: lineNumber,
                            error: errorKey,
                            description: errorDescription,
                            fileName: fileName,
                            filePath: folder
                        };
                        results.push(error);
                    }
                } catch (e) {
                    console.error("could not parse error:" + errortxt,e)
                }
            }
        }
        return results;
    }

    public static ServiceName: ServiceName = { Name: "AcmeInterpreter" };
}