// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IAsmFunAppData } from "../data/AsmFunAppData.js"
import { IMainData } from "../data/MainData.js";
import { ProjectService } from "../services/projectService.js";
import { IUserSettings, IProjectSettings, ISettings, ComputerRunMode } from "../data/ProjectData.js";
import { NotifyIcon } from "../common/Enums.js";
import { EditorEnableCommand } from "../data/commands/EditorCommands.js";
import { SettingsOpenManagerCommand, SettingsSelectCompilerFileCommand } from "../data/commands/SettingsCommands.js";
import { ApiService } from "../services/ApiService.js";
import { ServiceName } from "../serviceLoc/ServiceName.js";
import { ProjectSettingsLoaded, UserSettingsLoaded, UserSaveUserSettingsCommand } from "../data/commands/ProjectsCommands.js";
import { IFileDialogData } from "../data/FileManagerData.js";
import { FileOpenManagerCommand } from "../data/commands/FileCommands.js";
import { KeyboardManager } from "./KeyboardManager.js";


export class SettingsManager {

    private projectService: ProjectService;
    private mainData: IMainData;
    private myAppData: IAsmFunAppData;
    public settings: ISettings;
    private keyboard: KeyboardManager;

    constructor(mainData: IMainData) {
        var thiss = this;
        this.mainData = mainData;
        this.myAppData = mainData.appData;
        this.projectService = mainData.container.Resolve<ProjectService>(ProjectService.ServiceName) ?? new ProjectService(mainData);
        this.keyboard = this.mainData.container.Resolve<KeyboardManager>(KeyboardManager.ServiceName) ?? new KeyboardManager(mainData);
        this.settings = SettingsManager.NewData();
        this.settings.saveUserSettings = () => thiss.SaveUserSettings();
        this.settings.saveProjectSettings = () => thiss.SaveProjectSettings();
        var address = localStorage.getItem('serverAddressWithPort');
        if (address != null && address.startsWith("http"))
            this.settings.serverAddressWithPort = address;
        this.mainData.appData.settings = this.settings;
        var showAsmFunCode = localStorage.getItem('showASMFunCode');
        this.myAppData.showASMFunCode = showAsmFunCode == "true" || showAsmFunCode == null || showAsmFunCode == undefined;
        this.UpdateServerAddress();
        this.settings.keyMaps = this.keyboard.AllKeyMaps;
        this.settings.keyMapChanged = () => {
            if (this.settings.userSettings != null)
                this.settings.userSettings.computerSettings.keyMapIndex = this.settings.keyMaps.indexOf(this.settings.selectedKeyMap);
        };
        this.mainData.commandManager.Subscribe2(new SettingsOpenManagerCommand(null), this, x => this.OpenManager(x.state));
        this.mainData.commandManager.Subscribe2(new SettingsSelectCompilerFileCommand(null), this, x => this.SettingsSelectCompilerFile(x.type));
        this.mainData.commandManager.Subscribe2(new UserSaveUserSettingsCommand(), this, x => this.SaveUserSettings());
        this.mainData.eventManager.Subscribe2(new ProjectSettingsLoaded(), this, x => this.ParseProjectSettings(x.projectSettings));
        this.mainData.eventManager.Subscribe2(new UserSettingsLoaded(), this, x => this.ParseUserSettings(x.userSettings));
    }

   
    private ParseProjectSettings(projectSettings: IProjectSettings | null) {
        if (projectSettings == null) return;
        this.settings.projectSettings = projectSettings;
        if (projectSettings != null && projectSettings.configurations != null && projectSettings.configurations.length > 0) {
            this.settings.configuration = projectSettings.configurations[0];
        }
    }
    private ParseUserSettings(userSettings: IUserSettings | null) {
        if (userSettings == null) return;
        this.settings.userSettings = userSettings;
        if (userSettings.computerSettings.keyMapIndex < this.settings.keyMaps.length)
            this.settings.selectedKeyMap = this.settings.keyMaps[userSettings.computerSettings.keyMapIndex];
    }

    public SaveUserSettings() {
        localStorage.setItem('serverAddressWithPort', this.settings.serverAddressWithPort);
        localStorage.setItem('showASMFunCode', this.myAppData.showASMFunCode.toString());
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
        }, e => { });
    }
    private UpdateServerAddress() {
        ApiService.ServerAddress = this.settings.serverAddressWithPort;
    }


    private SettingsSelectCompilerFile(type: string | null) {
        var thiss = this;
        if (type == null || this.settings.userSettings == null) return;
        var ide = this.settings.userSettings.ideSettings;
        var fileDialogSettings: IFileDialogData = {
            filter: "*.exe",
            initialFolder: null,
            onSelected: () => { },
            selectAFile: true,
            title: "Select the " + type + " filename",
            subTitle: "*.exe",
            onClose: () => {},
        };
        var fn = "acme.exe";
        var inf: string | null = null;
        switch (type) {
            case "ACME": fn = "acme.exe"; inf = ide.acme.acmeFileName; break;
            case "Cc65": fn = "cl65.exe"; inf = ide.cc65.cc65FileName; break;
            case "VASM": fn = "vasm.exe"; inf = ide.vasm.vasmFileName; break;
            case "DASM": fn = "dasm.exe"; inf = ide.dasm.dasmFileName; break;
        }
        if (this.settings.userSettings.platform !== "Windows") {
            fn = fn.replace('.exe', '');
        }
        fileDialogSettings.initialFolder = inf;
        fileDialogSettings.subTitle = fn;
        fileDialogSettings.filter = fn;
        fileDialogSettings.onSelected = file => {
            if (file != null && file.length > 1) {
                switch (type) {
                    case "ACME": ide.acme.acmeFileName = file; break;
                    case "Cc65": ide.cc65.cc65FileName = file; break;
                    case "VASM": ide.vasm.vasmFileName = file; break;
                    case "DASM": ide.dasm.dasmFileName = file; break;
                }
            }
        };
        this.mainData.commandManager.InvokeCommand(new FileOpenManagerCommand(true, fileDialogSettings));
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
                thiss.Show();
            }, e => {
                thiss.Show();
            });
        }, er => {
            thiss.myAppData.ide.serverNotConnected = true;
            thiss.Show();
        });

    }
    private Show() {
        var thiss = this;
        this.settings.isVisible = true;
        setTimeout(() => { thiss.settings.isVisiblePopup = true; }, 10)
    }
    private Hide() {
        var thiss = this;
        setTimeout(() => { thiss.settings.isVisible = false; }, 200)
        this.settings.isVisiblePopup = false;
    }

    private Close() {
        this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(true));
        this.Hide();
    }

   

    public static NewData(): ISettings {
        return {
            isVisible: false,
            isVisiblePopup: false,
            saveProjectSettings: () => { },
            saveUserSettings: () => { },
            serverAddressWithPort: "http://localhost:5001",
            keyMaps: [],
            selectedKeyMap: "en-us",
            keyMapChanged: () => { },
        };
    }

    public static ServiceName: ServiceName = { Name: "SettingsManager" };
}