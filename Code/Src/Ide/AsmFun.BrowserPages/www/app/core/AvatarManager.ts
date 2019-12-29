// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IAsmFunAppData } from "../data/AsmFunAppData.js"
import { IMainData } from "../data/MainData.js";
import { IAvatarData, IAvatarMenuItem, IAvatarContext, IAvatar } from "../data/AvatarData.js";
import { IChatItem } from "../data/EntertainerData.js";
import { AvatarEmmanuel } from "../avatars/emmanuel/AvatarEmmanuel.js";
import { ServiceName } from "../serviceLoc/ServiceName.js";


export class AvatarManager implements IAvatarContext{
  
    private avatars: IAvatar[] = [];
    private data: IAvatarData; 
    private mainData: IMainData;
    private myAppData: IAsmFunAppData;

    public isVisible: boolean = false;

    constructor(mainData: IMainData) {
        var thiss = this;
        this.mainData = mainData;
        this.myAppData = mainData.appData;
        this.data = mainData.appData.avatar;
        this.avatars.push(new AvatarEmmanuel())
        this.loadDefault();
        this.data.swapOpenMenu = () => thiss.SwapOpenMenu();
        this.DesactivateAvatar();
    }
   

    // #region menu
    public SwapOpenMenu() {
        this.data.menu.isVisible = !this.data.menu.isVisible;
        this.data.entertainer.isActive = true;
        if (!this.data.menu.isVisible)
            this.CloseMenu();
        if (this.data.menu.isVisible) {
            this.ActivateAvatar();
        }
        else {
            this.DesactivateAvatar();
            this.CloseMenu();
        }
    }

    public SetRootMenuItems(avatar: IAvatar, menuItems: IAvatarMenuItem[]) {
        this.data.menu.menuItems = menuItems;
    }

    public MenuItemClick(avatar:IAvatar, menuItem: IAvatarMenuItem) {
        menuItem.isSelected = !menuItem.isSelected;
        this.AddChatUser(avatar, menuItem.label);
        menuItem.isSelected = true;
        this.data.menu.menuItems = menuItem.menuItems;
    }

    public ChildMenuItemClick(avatar: IAvatar,menuItem: IAvatarMenuItem, closeMenu:boolean = true) {
        menuItem.isSelected = true;
        this.AddChatUser(avatar,menuItem.label);
        if (closeMenu) {
            this.CloseMenu();
        }
    }

    private loadDefault() {
        var thiss = this;
        var avatar = this.GetCurrentEntertainer();
        this.data = {
            menu: { menuItems: [], isVisible: false },
            entertainer: avatar.GetEntertainer(this),
            swapOpenMenu: () => thiss.SwapOpenMenu()
        };
        this.mainData.appData.avatar = this.data;
        avatar.CreateRootMenu(this);
    }

    private ResetMenu() {
        this.ResetMenus(this.data.menu.menuItems);
    }

    private ResetMenus(menuItems: IAvatarMenuItem[]) {
        for (var i = 0; i < menuItems.length; i++) {
            var menuItem = menuItems[i];
            menuItem.isSelected = false;
            menuItem.isVisible = true;
            this.ResetMenus(menuItem.menuItems);
        }
    }
    // #endregion menu


    // #region chat
    public AddChatEntertainer(avatar: IAvatar,text: string) {
        var chatItem: IChatItem = { text: text, who: "entertainer", when: new Date().toLocaleTimeString() };
        this.data.entertainer.chat.chatItems.push(chatItem);
        if (this.data.entertainer.chat.chatItems.length > 9)
            this.data.entertainer.chat.chatItems.shift();
    }
    public AddChatUser(avatar: IAvatar,text: string) {
        var chatItem: IChatItem = { text: text, who: "user", when: new Date().toLocaleTimeString() };
        this.data.entertainer.chat.chatItems.push(chatItem);
        if (this.data.entertainer.chat.chatItems.length > 9)
            this.data.entertainer.chat.chatItems.shift();
    }
    public ClearChat() {
        this.data.entertainer.chat.chatItems = [];
    }
    public CloseMenu() {
        this.GetCurrentEntertainer().CreateRootMenu(this);
        this.data.menu.isVisible = false;
    }
    // #endregion chat


    // #region avatar
    private ActivateAvatar() {
        this.GetCurrentEntertainer().ActivateAvatar(this);
    }
    private DesactivateAvatar() {
        this.ClearChat();
        this.GetCurrentEntertainer().DesactivateAvatar(this);
        this.data.entertainer.isActive = false;
    }
    private GetCurrentEntertainer() {
        return this.avatars[0];
    }
    public SetImage(avatar: IAvatar, imgName: string) {
        this.data.entertainer.imageUrl = "../images/avatar/" + avatar.GetEntertainer(this).folderName + "/" + imgName;
    }
    // #endregion avatar


    // #region fullpage
    public OpenFullPageInfoByHtmlFile(avatar: IAvatar, title: string, fileName: string) {
        var thiss = this;
        this.OpenFullPageInfo(avatar, title, "Loading...");
        fetch("../images/avatar/" + avatar.GetEntertainer(thiss).folderName + "/" + fileName+"?t =" + (Math.random() * 10000))
            .then(data => data.text())
            .then(html => {
                thiss.OpenFullPageInfo(avatar, title, html);
            });
    }

    public OpenFullPageInfo(avatar: IAvatar,title: string, htmlContent: string) {
        var thiss = this;
        var el = document.getElementById('fullPageInfo');
        if (el != null) {
            el.style.display = "block";
            var el2T = document.getElementById('fullPageInfoTitle');
            if (el2T != null) el2T.innerHTML = title;
            var el2 = document.getElementById('fullPageInfoContent');
            if (el2 != null) el2.innerHTML = htmlContent;
            var el3 = document.getElementById('fullPageInfoBtnClose');
            if (el3 != null)
                el3.onclick = () => {
                    if (el != null)
                        el.style.display = "none";
                    thiss.CloseFullpage();
                }
        }
      
    }
    private CloseFullpage() {
        this.Close();
    }
    // #endregion fullpage


    public Close() {
        this.DesactivateAvatar();
        this.CloseMenu();
    }

    public OpenUrl(url: string) {
        this.CloseMenu();
        open(url, "_blank");
    }
    public static NewData(): IAvatarData {
        return {
            swapOpenMenu: () => { },
                menu: { menuItems: [], isVisible: false },
            entertainer: {
                name: "Emmanuel", imageUrl: "", chat: { chatItems: [] }, isActive: false, folderName: ""
            }
        }
    }


    public static ServiceName: ServiceName = { Name: "AvatarManager" };
}