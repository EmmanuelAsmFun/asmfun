// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { IEntertainer } from "./EntertainerData.js";

export interface IAvatarMenuItem {
    id: string;
    label: string;
    action: (m: IAvatarMenuItem) => void;
    menuItems: IAvatarMenuItem[];
    isSelected: boolean;
    isVisible: boolean;
}
export interface IAvatarMenu {
    menuItems: IAvatarMenuItem[];
    isVisible: boolean;
}
export interface IAvatarData {
    menu: IAvatarMenu;
    entertainer: IEntertainer;
    swapOpenMenu: () => void;
}
export interface IAvatarContext {
    SetImage(avatar: IAvatar, name: string);
    MenuItemClick(avatar: IAvatar, menuItem: IAvatarMenuItem, closeMenu?: boolean);
    ChildMenuItemClick(avatar: IAvatar, menuItem: IAvatarMenuItem, closeMenu?: boolean);
    AddChatEntertainer(avatar: IAvatar,text: string);
    AddChatUser(avatar: IAvatar,text: string);
    OpenFullPageInfo(avatar: IAvatar, title: string, html: string);
    OpenFullPageInfoByHtmlFile(avatar: IAvatar, title: string, fileName: string);
    CloseMenu();
    Close();
    OpenUrl(url: string);
    SetRootMenuItems(avatar: IAvatar, menuItems: IAvatarMenuItem[]);
}
export interface IAvatar {
    CreateRootMenu(context: IAvatarContext);
    GetEntertainer(context: IAvatarContext): IEntertainer;
    DesactivateAvatar(context: IAvatarContext);
    ActivateAvatar(context: IAvatarContext);
}