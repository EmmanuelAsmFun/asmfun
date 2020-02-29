// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import {IEditorLine, IPropertyType, PropertyNumType }
    from '../data/EditorData.js';
import { IInterpreter } from './IInterpreter.js';
import { ICompilationResult, ICompilationError } from "../data/CompilationDatas.js";
import { CommonInterpreter } from './CommonInterpreter.js';
import { IMainData } from '../../../framework/data/MainData.js';
import { OpcodeManager } from '../OpcodeManager.js';
import { ServiceName } from '../../../framework/serviceLoc/ServiceName.js';
import { InterpreterLine } from './InterpreterLine.js';
import { InterpreterBundle } from './InterpreterBundle.js';
import { EditorInsertTextCommand } from '../commands/EditorCommands.js';
import { ICodeAssistPopupDataItem } from '../data/ICodeAssistPopupData.js';


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
        });
    }
    public GetCompilerName() {
        return "ACME";
    }

    public InterpretLineParts(bundle: InterpreterBundle,interpretLine: InterpreterLine) {
        interpretLine.GetLineParts();
        var numParts = interpretLine.NoSpaceParts.length;
        if (numParts === 0) return;
        //if (interpretLine.Ui.LineNumber == 1412) 
        //    debugger;
        var partIndex = interpretLine.TryFindOpcode();
        if (partIndex == 1)
            interpretLine.ParseLabel(0);         // Part 0 is a label
        if (!interpretLine.OpcodeFound) {
            // If only one part, it's a label.
            if (numParts == 1 && interpretLine.NoSpaceParts[0].Text[0] !== "+") {
                interpretLine.ParseLabel(0);
                return;
            }
            var part1 = interpretLine.NoSpaceParts[0];

            // macro ?
            if (part1.Text === "!macro") {
                interpretLine.ParseMacro(1);
                return;
            }
            // link to macro ?
            if (part1.Text[0] === "+") {
                bundle.AddPotentialReference(interpretLine, part1);
                return;
            }
            // Is setter ?
            if (interpretLine.TryParseSetter()) return;

            // Zone ?
            if (part1.Text === "!zn" && numParts > 1) {
                interpretLine.ParseZone(1);
                return;
            }
            if (numParts > 1) {
                var part2 = interpretLine.NoSpaceParts[1];
                // Binary Data
                if (part2.Text === "!binary") {
                    interpretLine.ParseLabel(0);
                    return;
                }
                if (part1.Text === "!to" || part1.Text === "!cpu") {
                    //interpretLine.ParseLabel(0);
                    return;
                }
                if (part1.Text[0] === "}") {
                    // Close block;
                    return;
                }
                if (part1.Text[0] === "!") {
                    var prop = this.commonInterpreter.ConvertToPropertyType( part1.Text, interpretLine.Text.substr(part2.Index));
                    //interpretLine.ParseProperty(0);
                    //if (interpretLine.Property != null)
                    //    interpretLine.Property.Data = prop;
                    return;
                }
                if (numParts > 2) {
                    var part3 = interpretLine.NoSpaceParts[2];
                    if (part2.Text[0] === "!") {
                        interpretLine.ParsePropertyWithType(0);
                       
                        return;
                    }
                    interpretLine.Ui.HasError = true;
                    interpretLine.Ui.Error = {
                        compilerName: "Emmanuel",
                        isFromCompiler: false,
                        line: interpretLine.EditorLine.Ui,
                        message:"Don't know what you mean or haven't implemented it yet."
                    }
                }
            }
        } else {
            // opcode found
            if (interpretLine.NoSpaceParts.length == 2) {
                // Try get constant
                var constType = interpretLine.TryConstantValue(1);
                if (constType ===1) return;
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
    }

  

    public ConvertToPropertyType( propType: string, data: string): IPropertyType {
        return this.commonInterpreter.ConvertToPropertyType(propType, data);
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
                            LineNumber: lineNumber,
                            Error: errorKey,
                            Description: errorDescription,
                            FileName: fileName,
                            FilePath: folder,
                            FileIndex: 0,
                            Line: null,
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


    public PreInsertFromCodeAssist(command: EditorInsertTextCommand) {
        // The code assist wants to insert new text
        var selectedItem = <ICodeAssistPopupDataItem>command.data;
        // If it's a macro, we need to add '+' before
        if (selectedItem.IsMacro) {
            command.removeText = "+" + command.removeText;
            command.text = "+" + command.text;
        }
    }

    public static ServiceName: ServiceName = { Name: "AcmeInterpreter" };
}