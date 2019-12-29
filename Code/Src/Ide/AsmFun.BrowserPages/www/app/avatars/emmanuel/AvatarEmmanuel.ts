// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IAvatarData, IAvatarMenuItem, IAvatarContext, IAvatar } from "../../data/AvatarData.js";
import { IEntertainer } from "../../data/EntertainerData.js";

export class AvatarEmmanuel implements IAvatar{

    private entertainer: IEntertainer;

    public constructor() {
        this.entertainer = {
            chat: { chatItems: [] },
            folderName: "emmanuel",
            name: "Emmanuel",
            imageUrl: "",
            isActive: false,
        }
    }

    public ActivateAvatar(context: IAvatarContext) {
        context.SetImage(this,"emmanuel-working-yes.gif");
        context.AddChatUser(this,"Emmanuel?");
        context.AddChatEntertainer(this,"Yes?");
    }
    public DesactivateAvatar(context: IAvatarContext) {
        context.SetImage(this,"emmanuel-working-computer.gif");
    }

    public CreateRootMenu(context: IAvatarContext) {
        var thiss = this;
        context.SetRootMenuItems(thiss,[
            {
                id: "tellme",
                label: "Tell me, ",
                action: m => context.MenuItemClick(thiss, m),
                isSelected: false,
                isVisible: true,
                menuItems: [
                    {
                        id: "whyCreate",
                        label: "why have you created ASM Fun?",
                        action: m => {
                            context.ChildMenuItemClick(thiss, m);
                            context.AddChatEntertainer(thiss, "Well,");
                            context.OpenFullPageInfoByHtmlFile(this, "Why I am creating ASM Fun,", "Why-Created-AsmFun.html");
                            context.CloseMenu();
                        },
                        isSelected: false,
                        isVisible: true,
                        menuItems: [
                        ]
                    }, {
                        id: "shortcuts",
                        label: "what are the shortcuts in ASM Fun?",
                        action: m => {
                            context.ChildMenuItemClick(thiss, m, true);
                            context.AddChatEntertainer(thiss,"Look here :-)");
                            context.OpenFullPageInfoByHtmlFile(this, "Shortcuts", "shortcuts.html");
                            context.CloseMenu();
                        },
                        isSelected: false,
                        isVisible: true,
                        menuItems: [
                        ]
                    }
                ]
            },
            {
                id: "play",
                label: "Play ",
                action: m => context.MenuItemClick(thiss, m),
                isSelected: false,
                isVisible: true,
                menuItems: [
                    {
                        id: "theGuitar",
                        label: "The Guitar",
                        action: m => {
                            context.SetImage(this, "emmanuel-guitar.gif");
                            context.ChildMenuItemClick(thiss, m, true);
                            context.AddChatEntertainer(thiss, "I feel so romantic <3");
                            context.CloseMenu();
                        },
                        isSelected: false,
                        isVisible: true,
                        menuItems: [
                        ]
                    }, {
                        id: "hardRock",
                        label: "Hard Rock",
                        action: m => {
                            context.SetImage(this, "emmanuel-hardrock.gif");
                            context.ChildMenuItemClick(thiss, m, true);
                            context.AddChatEntertainer(thiss, "YEAHHHHHH!!!");
                            context.CloseMenu();
                        },
                        isSelected: false,
                        isVisible: true,
                        menuItems: [
                        ]
                    }
                ]
            },
            {
                id: "question",
                label: "Wanne contact you ",
                action: m => context.MenuItemClick(thiss, m),
                isSelected: false,
                isVisible: true,
                menuItems: [
                    {
                        id: "OnMurayforum",
                        label: "on Muray's forum",
                        action: m => {
                            context.OpenUrl("https://murray2.com/members/emmanuelasmfun.1087/");
                            context.Close();
                            context.CloseMenu();
                        },
                        isSelected: false,
                        isVisible: true,
                        menuItems: [
                        ]
                    }, {
                        id: "OnFacebook",
                        label: "on Facebook",
                        action: m => {
                            context.OpenUrl("https://www.facebook.com/EmmanuelsCreation/");
                            context.Close();
                            context.CloseMenu();
                        },
                        isSelected: false,
                        isVisible: true,
                        menuItems: [
                        ]
                    }
                ]
            },
            {
                id: "support",
                label: "I want to support you",
                action: m => context.MenuItemClick(thiss,m),
                isSelected: false,
                isVisible: true,
                menuItems: [
                    {
                        id: "buyCD",
                        label: "I'll buy your relaxing piano music...",
                        action: m => {
                            context.ChildMenuItemClick(thiss, m, true);
                            context.AddChatEntertainer(thiss, "Oh, that's nice!");
                            context.OpenUrl("https://innervibes.bandcamp.com/album/inside-the-piano");
                            context.CloseMenu();
                        },
                        isSelected: false,
                        isVisible: true,
                        menuItems: [
                        ]
                    },
                    {
                        id: "helpdevelop",
                        label: "with the development...",
                        action: m => {
                            context.ChildMenuItemClick(thiss, m, true);
                            context.AddChatEntertainer(thiss, "Oh, that's nice!");
                            context.OpenFullPageInfoByHtmlFile(this, "Support with the development", "dev-support.html");
                            context.CloseMenu();
                        },
                        isSelected: false,
                        isVisible: true,
                        menuItems: [
                        ]
                    },
                    {
                        id: "supportDonation",
                        label: "with a donation...",
                        action: m => {
                            context.OpenUrl("https://www.patreon.com/emmanuelthecreator");
                            context.Close();
                        },
                        isSelected: false,
                        isVisible: true,
                        menuItems: [
                        ]
                    }, {
                        id: "supportDonation",
                        label: "with Patreon...",
                        action: m => {
                            context.OpenUrl("https://www.patreon.com/emmanuelthecreator");
                            context.Close();
                        },
                        isSelected: false,
                        isVisible: true,
                        menuItems: [
                        ]
                    }
                ]
            },
            {
                id: "nevermind",
                label: "Nevermind",
                action: m => {
                    context.Close();
                },
                isSelected: false,
                isVisible: true,menuItems:[]
            }
        ]);
    }

   
    public GetEntertainer(context: IAvatarContext): IEntertainer {
        return this.entertainer;
    }
}