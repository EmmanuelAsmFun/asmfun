// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IEditorLine, IPropertyType, PropertyNumType }
    from '../data/EditorData.js';
import { IInterpretLine, IInterpretLinePart, LinePartType }
    from '../data/InterpreterData.js';
import { IInterpreter } from './IInterpreter.js';
import { ICompilationResult, ICompilationError } from "../data/CompilationDatas.js";
import { OpcodeManager } from '../OpcodeManager.js';
import { IMainData } from '../../../framework/data/MainData.js';
import { AsmTools } from '../../../Tools.js';
import { ServiceName } from '../../../framework/serviceLoc/ServiceName.js';


export interface ICommonCompilerData {
    compilerDatachar: string;
}

export class CommonInterpreter  {
    private cpChar: string = "!";

    private opcodeManager: OpcodeManager;
    private mainData: IMainData;
    private validReferenceChars = "abcdefghijklmnopqrstuvwqxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_1234567890.@";

    constructor(mainData: IMainData) {
        var thiss = this;
        this.opcodeManager = mainData.container.Resolve<OpcodeManager>(OpcodeManager.ServiceName) ?? new OpcodeManager();
        this.mainData = mainData;
    }
    public Init(initData: ICommonCompilerData) {
        this.cpChar = initData.compilerDatachar;
    }
 

  



    //public InterpretCompilerLine(lineWithoutComment: string, lineWithoutCommentNotrim: string, line: IEditorLine): ICodeBlockContext {
    //    line.dataCode = lineWithoutCommentNotrim;
    //    line.isCompilerData = true;
    //    var codeIndex = lineWithoutComment.indexOf('{');
    //    if (codeIndex > -1) {
    //        // Check if test
    //        var startDataIndex = lineWithoutComment.indexOf(this.cpChar+'if');
    //        if (startDataIndex > -1)
    //            return line.context.CreateIfCodeBlock(line, lineWithoutComment.substring(3, codeIndex - 1));
    //        // Check else
    //        startDataIndex = lineWithoutComment.indexOf('else {');
    //        if (startDataIndex > -1)
    //            return line.context.CreateElseCodeBlock(line);
    //        // Check address
    //        startDataIndex = lineWithoutComment.indexOf(this.cpChar+'addr');
    //        if (startDataIndex > -1)
    //            return line.context.CreateAddrCodeBlock(line, lineWithoutComment.substring(5, codeIndex - 1));
    //        // macro
    //        startDataIndex = lineWithoutComment.indexOf(this.cpChar+'macro');
    //        if (startDataIndex > -1) {
    //            var name = this.GetName(7, lineWithoutComment);
    //            var parameters: string[] = this.GetParameters(name, lineWithoutComment);
    //            return line.context.CreateMacro(line, name, parameters);
    //        }
    //        // zone
    //        startDataIndex = lineWithoutComment.indexOf(this.cpChar+'zn');
    //        if (startDataIndex > -1) {
    //            var name = this.GetName(4, lineWithoutComment);
    //            return line.context.CreateZone(line, name, false);
    //        }
    //        // for
    //        startDataIndex = lineWithoutComment.indexOf(this.cpChar+'for');
    //        if (startDataIndex > -1) {
    //            var parameters: string[] = this.GetParameters(this.cpChar+"for", lineWithoutComment);
    //            return line.context.CreateForBlock(line, parameters);
    //        }
    //        return line.context.CreateCodeBlock(line, "Unkown");
    //    }
    //    if (lineWithoutComment.indexOf('}') > -1) {
    //        // end code Block
    //        return line.context.CloseCurrentBlock(line);
    //    }
    //    var exclIndex = lineWithoutComment.indexOf(this.cpChar+'');
    //    if (exclIndex > 0 && lineWithoutComment.length > 3) {
    //        var wordPartsT = lineWithoutComment.split(' ');
    //        var wordParts: string[] = [];
    //        for (var i = 0; i < wordPartsT.length; i++) {
    //            if (wordPartsT[i] != "")
    //                wordParts.push(wordPartsT[i]);
    //        }
    //        if (wordParts.length > 2) {
    //            var propName = wordParts[0];
    //            var propType = wordParts[1];
    //            var valuesString = lineWithoutComment.substring(lineWithoutComment.indexOf(propType) + propType.length + 1).trim();
    //            var property = this.ConvertToProperty(propName, propType, valuesString);
    //            line.context.AddSetter(line, property);
    //        }
    //    }
    //    return line.context;
    //}



    public ConvertToPropertyType(propType: string, data: string): IPropertyType {
        propType = propType.toLowerCase();
        var returnData: IPropertyType = {
            dataItemLength: 0,
            dataLength: 0,
            dataNumType: PropertyNumType.Unknown,
            dataType: propType,
            defaultNumValue: 0,
            isBigEndian: false,
            dataString: data,
            isNumericLight:false,
        };
        switch (propType) {
            case this.cpChar+"8":
            case this.cpChar+"08":
            case this.cpChar+"by":
            case this.cpChar+"byte":
                // 8bit number
                returnData.dataItemLength = 1;
                returnData.isBigEndian = false;
                returnData.dataNumType = PropertyNumType.Byte;
                returnData.dataType = this.cpChar+"8";
                returnData.defaultNumValue = AsmTools.ConvertToNumber(data, true);
                returnData.isNumericLight = true;
                break;
            case this.cpChar+"16":
            case this.cpChar+"wo":
            case this.cpChar+"word":
            case this.cpChar+"le16":
                // 16bit number little-endian
                returnData.dataItemLength = 2;
                returnData.isBigEndian = false;
                returnData.dataNumType = PropertyNumType.Int16;
                returnData.dataType = this.cpChar+"le16";
                returnData.defaultNumValue = AsmTools.ConvertToNumber(data, false);
                returnData.isNumericLight = true;
            case this.cpChar+"be16":
                // 16bit number big-endian
                returnData.dataItemLength = 2;
                returnData.isBigEndian = true;
                returnData.dataNumType = PropertyNumType.Int16;
                returnData.dataType = this.cpChar+"be16";
                returnData.defaultNumValue = AsmTools.ConvertToNumber(data, true);
                returnData.isNumericLight = true;
                break;
            case this.cpChar+"24":
            case this.cpChar+"le24":
                // 24bit number little-endian
                returnData.dataItemLength = 3;
                returnData.isBigEndian = false;
                returnData.dataNumType = PropertyNumType.Int24;
                returnData.dataType = this.cpChar+"le24";
                returnData.defaultNumValue = AsmTools.ConvertToNumber(data, false);
                returnData.isNumericLight = true;
                break;
            case this.cpChar+"be24":
                // 24bit number big-endian
                returnData.dataItemLength = 3;
                returnData.isBigEndian = true;
                returnData.dataNumType = PropertyNumType.Int24;
                returnData.dataType = this.cpChar+"be24";
                returnData.defaultNumValue = AsmTools.ConvertToNumber(data, true);
                returnData.isNumericLight = true;
                break;
            case this.cpChar+"le32":
                // 32bit number little-endian
                returnData.dataItemLength = 4;
                returnData.isBigEndian = false;
                returnData.dataNumType = PropertyNumType.Int32;
                returnData.dataType = this.cpChar+"le32";
                returnData.defaultNumValue = AsmTools.ConvertToNumber(data, false);
                returnData.isNumericLight = true;
                break;
            case this.cpChar+"be32":
                // 32bit number big-endian
                returnData.dataItemLength = 4;
                returnData.isBigEndian = true;
                returnData.dataNumType = PropertyNumType.Int32;
                returnData.dataType = this.cpChar+"be32";
                returnData.defaultNumValue = AsmTools.ConvertToNumber(data, true);
                returnData.isNumericLight = true;
                break;
            case this.cpChar+"hex":
            case this.cpChar+"h":
                // hex values : !hex PAIRS_OF_HEX_DIGITS
                data = data.replace(/ /g, "");
                returnData.dataItemLength = data.length / 2;
                returnData.dataType = this.cpChar+"hex";
                break;
            case this.cpChar+"fill":
            case this.cpChar+"fi":
                returnData.dataType = this.cpChar+"fill";
                // !fill AMOUNT [, VALUE]
                try {
                    var number = parseInt(data.split(" ")[0]);
                    returnData.dataItemLength = number;
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
                if (data.length > 1) {
                    if (data[0] === "$") {
                        // Hex value
                        var cleanData = data.replace("$", "");
                        if (cleanData.length === 1 || cleanData.length === 3 || cleanData.length === 5)
                            cleanData = "0" + cleanData;
                        returnData.dataItemLength = cleanData.length / 2;
                        returnData.defaultNumValue = AsmTools.ConvertToNumber("0x" + cleanData, true);
                        returnData.isNumericLight = true;
                    } else if (data[0] === "%") {
                        // Binary value
                        var cleanData = data.replace("%", "");
                        returnData.dataItemLength = cleanData.length / 8;
                        returnData.defaultNumValue = parseInt(cleanData, 2);
                        returnData.isNumericLight = true;
                    } else if (data[0] === "&") {
                        // Octal value
                        returnData.dataItemLength = data.replace("&", "").length;
                        returnData.defaultNumValue = parseInt(data);
                        returnData.isNumericLight = true;
                    }
                    else {
                        // Int Value
                        var length = data.length;
                        if (length == 1 || length === 3 || length == 5)
                            length++;
                        returnData.dataItemLength = length / 2;
                        returnData.defaultNumValue = parseInt(data);
                        returnData.isNumericLight = true;
                    }
                }
                returnData.dataNumType =
                    returnData.dataItemLength === 1 ? PropertyNumType.Byte :
                        returnData.dataItemLength === 2 ? PropertyNumType.Int16 :
                            returnData.dataItemLength === 3 ? PropertyNumType.Int24 :
                                returnData.dataItemLength === 4 ? PropertyNumType.Int32 : PropertyNumType.Unknown;
                
        }
        return returnData;
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


    public static ServiceName: ServiceName = { Name: "CommonInterpreter" };
}