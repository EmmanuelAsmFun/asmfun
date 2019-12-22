// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

export interface IOpcodeData {
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