import { ICodeAssistable } from "./ICodeAssistPopupData.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

export interface IOpcodeData extends ICodeAssistable{
    code: string;
    asmFunCode: string;
    html?: string;
    searchCode?: string;
    isStack?: boolean;
    isJump?: boolean;
    hasRegisterA?: boolean;
    hasRegisterX?: boolean;
    hasRegisterY?: boolean;
    hasCarry?: boolean;
    hasDecimal?: boolean;
}
