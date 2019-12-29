// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { ArrayEx } from "../common/TsFixes.js";


export interface IProcessorData {

    /// <summary>
    /// pc
    /// 16 bit
    /// </summary>
    programCounter: number;
    /// <summary>
    /// sp
    /// 8 bit
    /// </summary>
    stackPointer: number;
    /// <summary>
    /// Accumulator register A
    /// 8 bit
    /// </summary>
    registerA: number;
    /// <summary>
    /// Register X
    /// 8 bit
    /// </summary>
    registerX: number;
    /// <summary>
    /// Register Y
    /// 8 bit
    /// </summary>
    registerY: number;
    /// <summary>
    /// status, p
    /// 8 bit
    /// </summary>
    statusRegister: number;


}


export interface IProcessorExtraData {
    clockticks6502: number;
    clockgoal6502: number;
    oldpc: number;
    ea: number;
    reladdr: number;
    value: number;
    result: number;
    opcode: number;
    oldstatus: number;
    penaltyOp: number;
    penaltyAddr: number;

}


export interface IMemoryData {
    ramRawData?: ArrayEx<number>
    romRawData?: ArrayEx<number>
}


export interface IProgramData {
    language: string;
    datas?: ArrayEx<IInstructionItemData>;
}


export interface IInstructionItemData {
    address: number;
    opcode: number;
    opcodeName: string;
    data1: number;
    data2: number;
    isBranch: boolean;
    dataString: string;
    dataLength: number;
    selected: boolean;
}


export interface IStackData
{
    datas?: IStackItemData[]; 
}
export interface IStackItemData {
    address: number;
    data1: number;
}
export interface IVideoData {
    vA: number;
    vD0: number;
    vD1: number;
    vCT: number;
}

