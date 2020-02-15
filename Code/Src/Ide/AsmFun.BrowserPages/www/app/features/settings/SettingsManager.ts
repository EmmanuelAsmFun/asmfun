// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { NotifyIcon } from "../../common/Enums.js";
import { SettingsOpenManagerCommand, SettingsSelectCompilerFileCommand } from "./commands/SettingsCommands.js";
import { ComputerStopCommand } from "../computer/commands/ComputerCommands.js";
import { UIDataNameSettings } from "./SettingsFactory.js";
import { ProjectService } from "../project/services/ProjectService.js";
import { IMainData } from "../../framework/data/MainData.js";
import { ISettings, IUserSettings, IProjectSettings } from "../project/data/ProjectData.js";
import { KeyboardManager } from "../keyboard/KeyboardManager.js";
import { UserSettingsLoaded, ProjectSettingsLoaded, UserSaveUserSettingsCommand } from "../project/commands/ProjectsCommands.js";
import { FileOpenManagerCommand } from "../fileManager/commands/FileCommands.js";
import { ServiceName } from "../../framework/serviceLoc/ServiceName.js";
import { ApiService } from "../../framework/services/ApiService.js";
import { IFileDialogData } from "../fileManager/data/FileManagerData.js";
import { UIDataNameEditor } from "../editor/EditorFactory.js";
import { IEditorManagerData } from "../editor/data/EditorData.js";
import { IPopupWindowData, IPopupWindow, IPopupSubscription, IPopupEventData } from "../../framework/data/IPopupData.js";


export class SettingsManager implements IPopupWindow {

    private projectService: ProjectService;
    private editorData: IEditorManagerData;
    private mainData: IMainData;
    public settings: ISettings;
    private keyboard: KeyboardManager;

    private popupMe: IPopupSubscription;
    public CanOpenPopup(evt: IPopupEventData) { evt.SetCanOpen(true); }
    public GetData(): IPopupWindowData {
        return this.settings;
    }

    constructor(mainData: IMainData) {
        var thiss = this;
        this.mainData = mainData;
        this.editorData = mainData.GetUIData(UIDataNameEditor);
        this.popupMe = mainData.popupManager.Subscribe(0, this);
        this.projectService = mainData.container.Resolve<ProjectService>(ProjectService.ServiceName) ?? new ProjectService(mainData);
        this.keyboard = this.mainData.container.Resolve<KeyboardManager>(KeyboardManager.ServiceName) ?? new KeyboardManager(mainData);
        this.settings = this.mainData.GetUIData(UIDataNameSettings);
        this.settings.saveUserSettings = () => thiss.SaveUserSettings();
        this.settings.saveProjectSettings = () => thiss.SaveProjectSettings();
        var address = localStorage.getItem('serverAddressWithPort');
        if (address != null && address.startsWith("http"))
            this.settings.serverAddressWithPort = address;
        
        var showAsmFunCode = localStorage.getItem('showASMFunCode');
        this.editorData.showASMFunCode = showAsmFunCode == "true" || showAsmFunCode == null || showAsmFunCode == undefined;
        this.UpdateServerAddress();
        this.settings.keyMaps = this.keyboard.GetAllKeyMaps();
        this.settings.keyMapChanged = () => {
            if (this.settings.userSettings != null) {
                var prev = this.settings.userSettings.computerSettings.keyMapIndex;
                this.settings.userSettings.computerSettings.keyMapIndex = this.settings.keyMaps.indexOf(this.settings.selectedKeyMap);
                if (prev !== this.settings.userSettings.computerSettings.keyMapIndex) {
                    // We need to load the new keymap in the computer
                    this.mainData.commandManager.InvokeCommand(new ComputerStopCommand());
                }
            }
        };
        this.mainData.commandManager.Subscribe2(new SettingsOpenManagerCommand(null), this, x => this.popupMe.SwitchState(x.state));
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
        localStorage.setItem('showASMFunCode', this.editorData.showASMFunCode.toString());
        this.UpdateServerAddress();
        if (this.settings.userSettings == null) return;
        this.projectService.SaveUserSettings(this.settings.userSettings, () => {
            this.mainData.appData.alertMessages.Notify("User settings saved.", NotifyIcon.OK);
        }, e => { });
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

    public OpeningPopup() {
        var thiss = this;
        this.projectService.GetUserSettings((r) => {
            thiss.settings.userSettings = r;
            thiss.projectService.GetProjectSettings((r) => {
            }, e => {
            });
        }, er => {
        });
    }
  
    public ClosingPopup() {
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