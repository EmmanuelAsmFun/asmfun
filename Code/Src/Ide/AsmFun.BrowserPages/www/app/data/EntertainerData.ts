// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

export interface IEntertainer
{
    isActive:boolean;
    name:string;
    folderName:string;
    imageUrl: string;
    chat: IChat;
}

export interface IChat {
    chatItems: IChatItem[]
}

export interface IChatItem {
    text: string;
    who: string;
    when: string;
}