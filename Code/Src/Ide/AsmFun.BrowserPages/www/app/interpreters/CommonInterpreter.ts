// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { OpcodeManager } from '../core/OpcodeManager.js';
import { IMainData } from "../data/MainData.js";
import { IEditorLine, ICodeBlockContext, IPropertyData, PropertyNumType }
    from '../data/EditorData.js';
import { IInterpreter } from './IInterpreter.js';
import { AsmTools } from '../Tools.js';
import { ServiceName } from '../serviceLoc/ServiceName.js';
import { ICompilationResult, ICompilationError } from "../data/CompilationDatas.js";

export interface ICommonCompilerData {
    compilerDatachar: string;
    InterpretCompilerLineMethod?: (lineWithoutComment: string, lineWithoutCommentNotrim: string, line: IEditorLine) => ICodeBlockContext;
    parseOpcodeMethod?: (lineWithoutCommentNotrim: string, line: IEditorLine) => boolean;
    postInterpretLineMethod?: (lineWithoutCommentNotrim: string, lineWithoutComment: string, line: IEditorLine) => ICodeBlockContext | null;
}

export class CommonInterpreter  {
    private cpChar: string = "!";
    private interpretCompilerLineMethod: (lineWithoutComment: string, lineWithoutCommentNotrim: string, line: IEditorLine) => ICodeBlockContext;
    parseOpcodeMethod: (lineWithoutCommentNotrim: string, line: IEditorLine) => boolean;
    postInterpretLineMethod: (lineWithoutCommentNotrim: string, lineWithoutComment: string, line: IEditorLine) => ICodeBlockContext | null;

    private opcodeManager: OpcodeManager;
    private mainData: IMainData;
    private validReferenceChars = "abcdefghijklmnopqrstuvwqxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_1234567890.";

    constructor(mainData: IMainData) {
        var thiss = this;
        this.opcodeManager = mainData.container.Resolve<OpcodeManager>(OpcodeManager.ServiceName) ?? new OpcodeManager();
        this.mainData = mainData;
        this.interpretCompilerLineMethod = this.InterpretCompilerLine;
        this.parseOpcodeMethod = this.parseOpcode;
        this.postInterpretLineMethod = (a, b) => null;
    }
    public Init(initData: ICommonCompilerData) {
        this.cpChar = initData.compilerDatachar;
        if (initData.InterpretCompilerLineMethod != null) this.interpretCompilerLineMethod = initData.InterpretCompilerLineMethod;
        if (initData.parseOpcodeMethod != null) this.parseOpcodeMethod = initData.parseOpcodeMethod;
        if (initData.postInterpretLineMethod != null) this.postInterpretLineMethod = initData.postInterpretLineMethod;
    }
 

    public InterpretLine(context: ICodeBlockContext, line: IEditorLine, fullParse: boolean = true): ICodeBlockContext {

        // remove tabs
        line.data.sourceCode = line.data.sourceCode.replace(/\t/g, "  ");
        var sc = line.data.sourceCode;
        if (sc.length === 0) return line.context;
        var lineWithoutCommentNotrim = sc;
        var lineWithoutComment = sc.trim();
        line.dataCode = "";
        line.hasError = false;
        line.comment = "";
        line.indent = "";

        // Remove all the tabs
        lineWithoutComment = lineWithoutComment.replace(/\t/g, " ");
        lineWithoutCommentNotrim = lineWithoutCommentNotrim.replace(/\t/g, " ");

        // Extract comment
        var commentIndex = lineWithoutCommentNotrim.indexOf(";");
        if (commentIndex > -1) {
            line.comment = lineWithoutCommentNotrim.substring(commentIndex, sc.length);
            lineWithoutCommentNotrim = lineWithoutCommentNotrim.substring(0, commentIndex)
            lineWithoutComment = lineWithoutCommentNotrim.trim();
        }

        // if there is no code left, we are done with this line.
        if (lineWithoutComment.length === 0) {
            line.dataCode = lineWithoutCommentNotrim;
            return line.context;
        }

        //if (line.data.lineNumber === 113) {
        //    var test = lineWithoutComment;
        //    debugger;
        //}

        // Compiler Line
        if (lineWithoutComment.indexOf(this.cpChar+'') > -1 || lineWithoutComment.indexOf('}') > -1) {
            //if (lineWithoutComment.indexOf(":") < 0)
            return this.interpretCompilerLineMethod(lineWithoutComment, lineWithoutCommentNotrim, line);
        }

        // Find opcode
        this.parseOpcodeMethod(lineWithoutCommentNotrim, line);

        if (line.opcode == null || line.opcode.code === "") {
            // Check if it's a line with a zone and an opcode
            var wordLines = lineWithoutComment.match(/[^ ]+/g);
            if (wordLines != null && wordLines.length > 1 && this.TryParseOpcodeWord(lineWithoutCommentNotrim, line, wordLines[1])) {
                // opcode found as second word, so first word is a zone
                if (line.opcode != null) {
                    var resultText = lineWithoutComment.replace(new RegExp(line.opcode.code, "ig"), "");
                    var context = this.InterpretZoneCreation(line, resultText, wordLines[0], true);
                    var indexZone = lineWithoutCommentNotrim.indexOf(wordLines[0]);
                    var indexOpcode = lineWithoutCommentNotrim.indexOf(wordLines[1]);
                    line.indent = lineWithoutCommentNotrim.substring(0, indexZone);
                    line.indentAfterZone = lineWithoutCommentNotrim.substring(indexZone + wordLines[0].length, indexOpcode);
                    line.dataCode = lineWithoutCommentNotrim.substring(indexOpcode + wordLines[1].length);
                    return context;
                }
            }

            // Check if it's a setter
            var setterIndex = lineWithoutComment.indexOf('=');
            if (setterIndex > -1) {
                return this.InterpretAddressSetter(context, line, lineWithoutComment, setterIndex);
            }

            // Check if it's a zone
            var wordWithoutSpace = wordLines != null ? wordLines[0] : "";
            var dottedIndex = wordWithoutSpace.indexOf(":");
            var isRootZone = dottedIndex === wordWithoutSpace.length - 1;
            if (isRootZone || wordWithoutSpace[0] == ".") {
                var context = this.InterpretZoneCreation(line, lineWithoutComment, wordWithoutSpace, isRootZone);
                if (dottedIndex > -1)
                    line.dataCode = lineWithoutCommentNotrim.substring(lineWithoutCommentNotrim.indexOf(":"));
                return context;
            }

            
            var newCtx = this.postInterpretLineMethod(lineWithoutCommentNotrim, lineWithoutComment, line);
            if (newCtx != null)
                return newCtx;

            // raw data line
            line.isSetRawData = true;
            if (lineWithoutComment.length > 0)
                line.hasError = true;
            return line.context;
        }

        var cleanLineData = line.dataCode.trim();
        if (cleanLineData.length === 0)
            return line.context;

        if (cleanLineData.length > 1 && cleanLineData[0] === "#") {
            if (cleanLineData.length > 2 && (cleanLineData[1] === "<" || cleanLineData[1] === ">")) {
                var labelRef = cleanLineData.substring(2, cleanLineData.length);
                context.AddPotentialReference(line, labelRef);
                line.isDataTransfer = true;
                line.hasError = false;
            }
            line.isFixValue = true;
            return line.context;
        }
        if (cleanLineData.length > 0 && cleanLineData[0] == "$") {

        }
        else {

            // todo: what's this? : (vA), y
            var commaIndex = cleanLineData.indexOf(",");
            if (commaIndex > -1) {
                return line.context;
            }
            // check for anonoumous line references
            var isNextAn = cleanLineData === "+" || cleanLineData.indexOf("++") > -1;
            var isPrevAn = cleanLineData === "-" || cleanLineData.indexOf("--") > -1;
            if (isNextAn || isPrevAn) {
                line.isAnonymousZone = true;
                return line.context;
            }
            //if (cleanLineData.indexOf("Sys_rand_mem") > -1) {
            //    debugger;
            //}
            var name = this.RemoveOperatorsParts(cleanLineData);

            if (name.length > 0 && name !== "0") // a simple 0 set is allowed
                context.AddPotentialReference(line, name);
        }
        return line.context;
    }


    private InterpretZoneCreation(line: IEditorLine, lineWithoutComment: string, wordWithoutSpace: string, isRootZone: boolean): ICodeBlockContext {
        var zoneName = isRootZone ? wordWithoutSpace : wordWithoutSpace;
        var isLocalZone = wordWithoutSpace[0] == ".";
        line.context.CreateZone(line, zoneName, isLocalZone);
        line.dataCode = lineWithoutComment.replace(wordWithoutSpace, "");
        return line.context;
    }


    private InterpretAddressSetter(context: ICodeBlockContext, line: IEditorLine, lineWithoutComment: string, setterIndex: number): ICodeBlockContext {
        var propName = lineWithoutComment.substr(0, setterIndex).trim();
        var value = lineWithoutComment.substr(setterIndex + 1).trim();
        if (propName == "*") {
            // todo
            console.log("todo: InterpretSetter with * on line " + line.data.lineNumber);
        } else {
            var address = AsmTools.ConvertToNumber(value, true);
            context.AddAddressSetter(line, propName, address);
        }
        return line.context;
    }

    private RemoveOperatorsParts(data: string): string {
        for (var i = 0; i < data.length; i++) {
            if (this.validReferenceChars.indexOf(data[i]) > -1)
                continue;
            return data.substring(0, i);
        }
        return data;
    }

    public InterpretCompilerLine(lineWithoutComment: string, lineWithoutCommentNotrim: string, line: IEditorLine): ICodeBlockContext {
        line.dataCode = lineWithoutCommentNotrim;
        line.isCompilerData = true;
        var codeIndex = lineWithoutComment.indexOf('{');
        if (codeIndex > -1) {
            // Check if test
            var startDataIndex = lineWithoutComment.indexOf(this.cpChar+'if');
            if (startDataIndex > -1)
                return line.context.CreateIfCodeBlock(line, lineWithoutComment.substring(3, codeIndex - 1));
            // Check else
            startDataIndex = lineWithoutComment.indexOf('else {');
            if (startDataIndex > -1)
                return line.context.CreateElseCodeBlock(line);
            // Check address
            startDataIndex = lineWithoutComment.indexOf(this.cpChar+'addr');
            if (startDataIndex > -1)
                return line.context.CreateAddrCodeBlock(line, lineWithoutComment.substring(5, codeIndex - 1));
            // macro
            startDataIndex = lineWithoutComment.indexOf(this.cpChar+'macro');
            if (startDataIndex > -1) {
                var name = this.GetName(7, lineWithoutComment);
                var parameters: string[] = this.GetParameters(name, lineWithoutComment);
                return line.context.CreateMacro(line, name, parameters);
            }
            // zone
            startDataIndex = lineWithoutComment.indexOf(this.cpChar+'zn');
            if (startDataIndex > -1) {
                var name = this.GetName(4, lineWithoutComment);
                return line.context.CreateZone(line, name, false);
            }
            // for
            startDataIndex = lineWithoutComment.indexOf(this.cpChar+'for');
            if (startDataIndex > -1) {
                var parameters: string[] = this.GetParameters(this.cpChar+"for", lineWithoutComment);
                return line.context.CreateForBlock(line, parameters);
            }
            return line.context.CreateCodeBlock(line, "Unkown");
        }
        if (lineWithoutComment.indexOf('}') > -1) {
            // end code Block
            return line.context.CloseCurrentBlock(line);
        }
        var exclIndex = lineWithoutComment.indexOf(this.cpChar+'');
        if (exclIndex > 0 && lineWithoutComment.length > 3) {
            var wordPartsT = lineWithoutComment.split(' ');
            var wordParts: string[] = [];
            for (var i = 0; i < wordPartsT.length; i++) {
                if (wordPartsT[i] != "")
                    wordParts.push(wordPartsT[i]);
            }
            if (wordParts.length > 2) {
                var propName = wordParts[0];
                var propType = wordParts[1];
                var valuesString = lineWithoutComment.substring(lineWithoutComment.indexOf(propType) + propType.length + 1).trim();
                var property = this.ConvertToProperty(propName, propType, valuesString);
                line.context.AddSetter(line, property);
            }
        }
        return line.context;
    }



    public ConvertToProperty(name: string, propType: string, data: string): IPropertyData {
        var returnData: IPropertyData = {
            dataLength: 0,
            dataNumType: PropertyNumType.Unknown,
            dataType: propType,
            defaultNumValue: 0,
            isBigEndian: false,
            name: name.replace(":", ""),
            nameDirty: name,
        };
        switch (propType) {
            case this.cpChar+"8":
            case this.cpChar+"08":
            case this.cpChar+"by":
            case this.cpChar+"byte":
                // 8bit number
                returnData.dataLength = 1;
                returnData.isBigEndian = false;
                returnData.dataNumType = PropertyNumType.Byte;
                returnData.dataType = this.cpChar+"8";
                returnData.defaultNumValue = AsmTools.ConvertToNumber(data, false);
                break;
            case this.cpChar+"16":
            case this.cpChar+"wo":
            case this.cpChar+"word":
            case this.cpChar+"le16":
                // 16bit number little-endian
                returnData.dataLength = 2;
                returnData.isBigEndian = false;
                returnData.dataNumType = PropertyNumType.Int16;
                returnData.dataType = this.cpChar+"le16";
                returnData.defaultNumValue = AsmTools.ConvertToNumber(data, false);
            case this.cpChar+"be16":
                // 16bit number big-endian
                returnData.dataLength = 2;
                returnData.isBigEndian = true;
                returnData.dataNumType = PropertyNumType.Int16;
                returnData.dataType = this.cpChar+"be16";
                returnData.defaultNumValue = AsmTools.ConvertToNumber(data, true);
                break;
            case this.cpChar+"24":
            case this.cpChar+"le24":
                // 24bit number little-endian
                returnData.dataLength = 3;
                returnData.isBigEndian = false;
                returnData.dataNumType = PropertyNumType.Int24;
                returnData.dataType = this.cpChar+"le24";
                returnData.defaultNumValue = AsmTools.ConvertToNumber(data, false);
                break;
            case this.cpChar+"be24":
                // 24bit number big-endian
                returnData.dataLength = 3;
                returnData.isBigEndian = true;
                returnData.dataNumType = PropertyNumType.Int24;
                returnData.dataType = this.cpChar+"be24";
                returnData.defaultNumValue = AsmTools.ConvertToNumber(data, true);
                break;
            case this.cpChar+"le32":
                // 32bit number little-endian
                returnData.dataLength = 4;
                returnData.isBigEndian = false;
                returnData.dataNumType = PropertyNumType.Int32;
                returnData.dataType = this.cpChar+"le32";
                returnData.defaultNumValue = AsmTools.ConvertToNumber(data, false);
                break;
            case this.cpChar+"be32":
                // 32bit number big-endian
                returnData.dataLength = 4;
                returnData.isBigEndian = true;
                returnData.dataNumType = PropertyNumType.Int32;
                returnData.dataType = this.cpChar+"be32";
                returnData.defaultNumValue = AsmTools.ConvertToNumber(data, true);
                break;
            case this.cpChar+"hex":
            case this.cpChar+"h":
                // hex values : !hex PAIRS_OF_HEX_DIGITS
                data = data.replace(/ /g, "");
                returnData.dataLength = data.length / 2;
                returnData.dataType = this.cpChar+"hex";
                break;
            case this.cpChar+"fill":
            case this.cpChar+"fi":
                returnData.dataType = this.cpChar+"fill";
                // !fill AMOUNT [, VALUE]
                try {
                    var number = parseInt(data.split(" ")[0]);
                    returnData.dataLength = number;
                } catch (e) {
                    console.error("asm: could not parse " + data);
                }
                break;
            case this.cpChar+"pet":
            case this.cpChar+"raw":
            case this.cpChar+"scr":
            case this.cpChar+"ct":
            case this.cpChar+"text":
            case this.cpChar+"tx":
            case this.cpChar+"scrxor":
            case this.cpChar+"source":
            case this.cpChar+"binary":
            case this.cpChar+"bin":
                // string text

                break;
            case "":
                var plusIndex = name.indexOf('+');
                if (plusIndex > -1) {
                    returnData.dataLength = Number(name.substr(plusIndex + 1));
                    returnData.name = name.substr(0, plusIndex);
                }
                else {
                    if (data.length > 1) {
                        if (data[0] === "$") {
                            // Hex value
                            var cleanData = data.replace("$", "");
                            if (cleanData.length === 1 || cleanData.length === 3 || cleanData.length === 5)
                                cleanData = "0" + cleanData;
                            returnData.dataLength = cleanData.length / 2;
                            returnData.defaultNumValue = AsmTools.ConvertToNumber("0x" + cleanData, true);
                        } else if (data[0] === "%") {
                            // Binary value
                            var cleanData = data.replace("%", "");
                            returnData.dataLength = cleanData.length / 8;
                            returnData.defaultNumValue = parseInt(cleanData, 2);
                        } else if (data[0] === "&") {
                            // Octal value
                            returnData.dataLength = data.replace("&", "").length;
                            returnData.defaultNumValue = parseInt(data);
                        }
                        else {
                            // Int Value
                            var length = data.length;
                            if (length == 1 || length === 3 || length == 5)
                                length++;
                            returnData.dataLength = length / 2;
                            returnData.defaultNumValue = parseInt(data);
                        }
                    }
                    returnData.dataNumType =
                        returnData.dataLength === 1 ? PropertyNumType.Byte :
                            returnData.dataLength === 2 ? PropertyNumType.Int16 :
                                returnData.dataLength === 3 ? PropertyNumType.Int24 :
                                    returnData.dataLength === 4 ? PropertyNumType.Int32 : PropertyNumType.Unknown;
                }
        }
        return returnData;
    }

    public InterpretMacroCall(line: IEditorLine, lineWithoutComment: string): ICodeBlockContext {
        var name = this.GetName(1, lineWithoutComment);
        //if (lineWithoutComment.indexOf("VERA_END_IRQ") > -1) {
        //    var test = name;
        //    debugger;
        //}
        line.context.AddPotentialReference(line, name);
        return line.context;
    }

    public GetName(startLength: number, lineWithoutComment: string): string {
        lineWithoutComment = lineWithoutComment.replace("{", "");
        var macroParts = lineWithoutComment.substring(startLength, lineWithoutComment.length).split(' ');
        var name = "";
        if (macroParts.length > 0)
            name = macroParts[0];
        return name;
    }

    public GetParameters(name: string, lineWithoutComment: string): string[] {
        // remove name
        lineWithoutComment = lineWithoutComment.substring(lineWithoutComment.indexOf(name) + name.length, lineWithoutComment.length - 1);
        // Retrieve parameters
        var parametersDirty = lineWithoutComment.split(',');
        var parameters: string[] = [];
        for (var i = 0; i < parametersDirty.length; i++) {
            var clean: string = parametersDirty[i].trim();
            if (clean != "")
                parameters.push(clean);
        }
        return parameters;
    }




    public parseOpcode(lineWithoutCommentNotrim: string, line: IEditorLine): boolean {
        var cleanLine = lineWithoutCommentNotrim.substring(line.preCode.length).trim();
        if (cleanLine.indexOf("=") > -1) {
            line.dataCode = lineWithoutCommentNotrim;
            line.opcode = null;
            return false;
        }
        if ((cleanLine.length > 3 && cleanLine[3] === " ") || cleanLine.length === 3) {
            var sourceOpcode = cleanLine.substring(0, 3);
            return this.TryParseOpcodeWord(lineWithoutCommentNotrim, line, sourceOpcode);
        }
        else {
            line.dataCode = lineWithoutCommentNotrim;
        }
        return false;
    }

    private TryParseOpcodeWord(lineWithoutCommentNotrim: string, line: IEditorLine, sourceOpcode: string): boolean {
        var opcode = sourceOpcode.toLowerCase();
        var opcodeObj = this.opcodeManager.getValidOpcode(opcode);
        if (opcodeObj == null) {
            line.dataCode = lineWithoutCommentNotrim;
            line.opcode = null;
            return false;
        }
        line.opcode = opcodeObj;
        if (opcode[0] === "b")
            line.isCompare = true;
        if (opcode[0] === "j")
            line.isJump = true;
        if (opcode === "rts") line.isReturn = true;
        var opcodePlace = lineWithoutCommentNotrim.indexOf(sourceOpcode) + 3;
        line.indent = Array(opcodePlace - 3 + 1).join(' ');
        line.dataCode = lineWithoutCommentNotrim.substring(opcodePlace, lineWithoutCommentNotrim.length);
        return true;
    }

  

    public static ServiceName: ServiceName = { Name: "CommonInterpreter" };
}