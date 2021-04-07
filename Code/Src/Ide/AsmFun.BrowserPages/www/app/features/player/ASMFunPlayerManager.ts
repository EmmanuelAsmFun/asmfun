import { ProjectService } from "../project/services/ProjectService.js";
import { IMainData } from "../../framework/data/MainData.js";
import { IAsmFunAppData, IAsmFunIdeData, BrowserTypes } from "./data/AsmFunAppData.js";
import { ASMFunPlayerOpenManagerCommand, ASMFunPlayerSelectOSCommand, IdeSelectCodeNavTabCommand } from "./commands/ASMFunPlayerManagerCommands.js";
import { ApiService } from "../../framework/services/ApiService.js";
import { ConfirmIcon, NotifyIcon } from "../../common/Enums.js";
import { ServiceName } from "../../framework/serviceLoc/ServiceName.js";
import { UserSaveUserSettingsCommand } from "../project/commands/ProjectsCommands.js";
import { ProjectManager } from "../project/ProjectManager.js";
import { UIDataNamePlayer } from "./PlayerFactory.js";
import { EditorManager } from "../editor/EditorManager.js";
import { IPopupWindow, IPopupWindowData, IPopupSubscription, IPopupEventData } from "../../framework/data/IPopupData.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion



export class ASMFunPlayerManager implements IPopupWindow {
   
   

    private projectService: ProjectService;
    private mainData: IMainData;
    private data: IAsmFunIdeData;

    private popupMe: IPopupSubscription;
    public CanOpenPopup(evt: IPopupEventData) { evt.SetCanOpen(true); }
    public OpeningPopup() { }
    public ClosingPopup() { }
    public GetData(): IPopupWindowData {
        return this.data;
    }

    constructor(mainData: IMainData) {
        var thiss = this;
        this.mainData = mainData;
        this.data = mainData.GetUIData(UIDataNamePlayer);
        this.projectService = new ProjectService(mainData);
        var address = localStorage.getItem('serverAddressWithPort');
        if (address != null && address.startsWith("http"))
            ApiService.ServerAddress = address;
        var os = this.GetOS();
        if (os === BrowserTypes.Windows) this.data.isWindows = true;
        else if (os === BrowserTypes.MacOS || os === BrowserTypes.iOS) this.data.isMac = true;
        else if (os === BrowserTypes.Android || os === BrowserTypes.Linux) this.data.isLinux = true;

        this.popupMe = this.mainData.popupManager.Subscribe(0, this);
        this.mainData.commandManager.Subscribe2(new ASMFunPlayerOpenManagerCommand(null), this, x => this.popupMe.SwitchState(x.state));
        this.mainData.commandManager.Subscribe2(new ASMFunPlayerSelectOSCommand(""), this, x => this.SelectOS(x.osName));
        this.mainData.commandManager.Subscribe2(new IdeSelectCodeNavTabCommand(""), this, x => this.SelectCodeNavTab(x.tabName));
        
        thiss.data.serverNotConnected = true;
        thiss.data.isPlayerLocal = document.location.href.indexOf("fromlocal=true") > 1;
        this.data.onDone = () => {
            this.Save();
            this.Done();
        }
        this.data.SelectCodeNavTab = (tabName) => this.SelectCodeNavTab(tabName);
        if (document.location.href.indexOf("popup=Downloads") > -1)
            setTimeout(() => this.popupMe.Open(), 200);
    }


   

    public Launch() {
        if (document.location.host.indexOf("localhost:5001") <= -1) {
            this.mainData.appData.alertMessages.Confirm("Under construction",
                "<img width=\"140\" src=\"/images/avatar/emmanuel/emmanuel-start-fixin.gif\" style=\"float:left;margin: 20px 5px 40px -10px;\" />"
                + "Dear visitor,<br /><br /> I'm currently working on this IDE. It already works very well, so you are more than welcome to test."
                + "There are probably some unknown bugs, use CTRL-S to save at regular times. This saves and creates a backup. "
                + "You can play around and have some fun with the IDE.<br /><br />Emmanuel"
                + "", ConfirmIcon.OK, () => {

                });
        }
        this.CheckPlayerAvailable(() => { }, () => { }, true);
    }

    public CheckPlayerAvailable(ok: () => void, notOk: () => void, hasAutoChecked: boolean) {
        var thiss = this;
        //fetch("https://asmfun.com/api/ASMFunPlayerInfo.json")
        fetch("/api/ASMFunPlayerInfo.json")
            .then(r => r.json())
            .then(r => {
                thiss.data.latestVersion = r.latestVersion;
                thiss.projectService.GetUserSettings((s) => {
                    thiss.data.serverNotConnected = false;
                    thiss.data.currentVersion = s.serverVersion;
                    thiss.data.showDownloads = false;
                    if (s.serverVersion != null && s.serverVersion !== thiss.data.latestVersion) {
                        // New version available
                        thiss.data.newVersionAvailable = true;
                    }
                    if (hasAutoChecked)
                        this.Done();
                    ok();
                }, () => {
                        thiss.data.serverNotConnected = true;
                        thiss.data.showDownloads = true;
                        thiss.data.isVisible = true;
                        thiss.popupMe.Open();
                        notOk();
                        this.mainData.appData.alertMessages.Notify("Nope, not running.", NotifyIcon.Alert);
                });
            });
    }

    private Done() {
        var svc = this.mainData.container.Resolve<ProjectManager>(ProjectManager.ServiceName);
        var svcEditor = this.mainData.container.Resolve<EditorManager>(EditorManager.ServiceName);
        if (svc != null && svcEditor != null && !svcEditor.HasFiles())
            svc.LoadOne();
        
        this.popupMe.Close();
    }

    private Save() {
        this.mainData.commandManager.InvokeCommand(new UserSaveUserSettingsCommand());
    }

    private SelectOS(osName: string) {
        this.ClearOS();
        switch (osName) {
            case "Windows": this.data.isWindows = true; return;
            case "Mac": this.data.isMac = true; return;
            case "Linux": this.data.isLinux = true; return;
        }
        // default value
        this.data.isWindows = true;
    }

    private ClearOS() {
        this.data.isWindows = false;
        this.data.isMac = false;
        this.data.isLinux = false;
    }

    private GetOS(): BrowserTypes {
        var userAgent = window.navigator.userAgent;
        var platform = window.navigator.platform;
        var macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
        var windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
        var iosPlatforms = ['iPhone', 'iPad', 'iPod'];

        if (macosPlatforms.indexOf(platform) !== -1)
            return BrowserTypes.MacOS;
        else if (iosPlatforms.indexOf(platform) !== -1)
            BrowserTypes.iOS;
        else if (windowsPlatforms.indexOf(platform) !== -1)
            return BrowserTypes.Windows;
        else if (/Android/.test(userAgent))
            return BrowserTypes.Android;
        else if (/Linux/.test(platform))
            return BrowserTypes.Linux;

        return BrowserTypes.Unknown;
    }

    private SelectCodeNavTab(tabName: string): void {
        switch (tabName) {
            case "Variables":
                this.data.showVariables = true;
                this.data.showLabels = false;
                this.data.showMacros = false;
                break;
            case "Labels":
                this.data.showVariables = false;
                this.data.showLabels = true;
                this.data.showMacros = false;
                break;
            case "Macros":
                this.data.showVariables = false;
                this.data.showLabels = false;
                this.data.showMacros = true;
                break;
        }
    }

    public static NewData(): IAsmFunIdeData {
        return {
            serverNotConnected: false,
            hasConfirmedLicense: false,
            showDownloads: true,
            isLinux: false,
            isMac: false,
            isWindows: false,
            currentVersion: "0.0.0.0",
            newVersionAvailable: false,
            latestVersion: "0.0.0.0",
            isVisible: false,
            isVisiblePopup: false,
            isPlayerLocal: false,
            onDone: () => { },

            showMacros: false,
            showVariables: false,
            showLabels: true,
            showMoreDownloads: false,
            SelectCodeNavTab: n => { },
        };
    }


    public static ServiceName: ServiceName = { Name: "ASMFunPlayerManager" };
}
