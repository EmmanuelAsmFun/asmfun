﻿// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { IAsmFunAppData } from "../data/AsmFunAppData.js"
import { IMainData } from "../data/MainData.js";
import { ProjectService } from "../services/projectService.js";
import { IUserSettings, IProjectSettings, ISettings } from "../data/ProjectData.js";
import { NotifyIcon } from "../common/Enums.js";
import { EditorEnableCommand } from "../data/commands/EditorCommands.js";
import { SettingsOpenManagerCommand } from "../data/commands/SettingsCommands.js";
import { ApiService } from "../services/ApiService.js";
import { ServiceName } from "../serviceLoc/ServiceName.js";


export class SettingsManager {

    private projectService: ProjectService;
    private mainData: IMainData;
    private myAppData: IAsmFunAppData;
    public settings: ISettings;

    constructor(mainData: IMainData) {
        var thiss = this;
        this.mainData = mainData;
        this.myAppData = mainData.appData;
        this.projectService = new ProjectService();
        this.settings = SettingsManager.NewData();
        this.settings.saveUserSettings = () => thiss.SaveUserSettings();
        this.settings.saveProjectSettings = () => thiss.SaveProjectSettings();
        var address = localStorage.getItem('serverAddressWithPort');
        if (address != null && address.startsWith("http"))
            this.settings.serverAddressWithPort = address;
        this.mainData.appData.settings = this.settings;
        this.mainData.commandManager.Subscribe2(new SettingsOpenManagerCommand(null), this, x => this.OpenManager(x.state));
        this.UpdateServerAddress();
    }

    private OpenManager(state: boolean | null) {
        if (state == null)
            state = !this.settings.isVisible;
        if (state === this.settings.isVisible) return;
        if (!state)
            this.Close();
        else
            this.Open();
    }


    private Open() {
        var thiss = this;
        this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(false));
        this.projectService.GetUserSettings((r) => {
            thiss.settings.userSettings = r;
            this.myAppData.ide.serverNotConnected = false;
            thiss.projectService.GetProjectSettings((r) => {
                thiss.settings.projectSettings = r;
                thiss.settings.isVisible = true;
                if (r != null && r.configurations != null && r.configurations.length > 0) {
                    thiss.settings.configuration = r.configurations[0];
                }
            }, e => {
                
                thiss.settings.isVisible = true;
            });
        }, er => {
            thiss.myAppData.ide.serverNotConnected = true;
            thiss.settings.isVisible = true;
        });
        
    }

    private Close() {
        this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(true));
        this.settings.isVisible = false;
    }

    public SaveUserSettings() {
        localStorage.setItem('serverAddressWithPort', this.settings.serverAddressWithPort);
        this.UpdateServerAddress();
        if (this.settings.userSettings == null) return;
        this.projectService.SaveUserSettings(this.settings.userSettings, () => {
            this.mainData.appData.alertMessages.Notify("User settings saved.", NotifyIcon.OK);
        });
    }
    public SaveProjectSettings() {
        if (this.settings.projectSettings == null) return;
        this.projectService.SaveProjectSettings(this.settings.projectSettings, () => {
            this.mainData.appData.alertMessages.Notify("Project settings saved.", NotifyIcon.OK);
        });
    }
    private UpdateServerAddress() {
        ApiService.ServerAddress = this.settings.serverAddressWithPort;
    }

    public static NewData(): ISettings {
        return {
            isVisible: false,
            saveProjectSettings: () => { },
            saveUserSettings: () => { },
            serverAddressWithPort: "http://localhost:5001"
        };
    }

    public static ServiceName: ServiceName = { Name: "SettingsManager" };
}