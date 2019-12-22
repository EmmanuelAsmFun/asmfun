// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
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