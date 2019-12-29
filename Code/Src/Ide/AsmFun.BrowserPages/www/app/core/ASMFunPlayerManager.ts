// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IAsmFunAppData, IAsmFunIdeData, BrowserTypes } from "../data/AsmFunAppData.js"
import { IMainData } from "../data/MainData.js";
import { ProjectService } from "../services/projectService.js";
import { ApiService } from "../services/ApiService.js";
import { ConfirmIcon, NotifyIcon } from "../common/Enums.js";
import { ServiceName } from "../serviceLoc/ServiceName.js";
import { ProjectManager } from "./ProjectManager.js";
import { ASMFunPlayerOpenManagerCommand, ASMFunPlayerSelectOSCommand } from "../data/commands/ASMFunPlayerManagerCommands.js";


export class ASMFunPlayerManager {

    private projectService: ProjectService;
    private mainData: IMainData;
    private myAppData: IAsmFunAppData;
    private data: IAsmFunIdeData;

    constructor(mainData: IMainData) {
        var thiss = this;
        this.mainData = mainData;
        this.myAppData = mainData.appData;
        this.data = mainData.appData.ide;
        this.projectService = new ProjectService();
        var address = localStorage.getItem('serverAddressWithPort');
        if (address != null && address.startsWith("http"))
            ApiService.ServerAddress = address;
        var os = this.GetOS();
        if (os === BrowserTypes.Windows) this.data.isWindows = true;
        else if (os === BrowserTypes.MacOS || os === BrowserTypes.iOS) this.data.isMac = true;
        else if (os === BrowserTypes.Android || os === BrowserTypes.Linux) this.data.isLinux = true;
        this.mainData.commandManager.Subscribe2(new ASMFunPlayerOpenManagerCommand(null), this, x => this.OpenManager(x.state));
        this.mainData.commandManager.Subscribe2(new ASMFunPlayerSelectOSCommand(""), this, x => this.SelectOS(x.osName));
    }

    private OpenManager(state: boolean | null) {
        if (state == null)
            state = !this.data.isVisiblePlayerManager;
        if (state === this.data.isVisiblePlayerManager) return;
        if (!state)
            this.Close();
        else
            this.Open();
    }


    private Open() {
        var thiss = this;
        this.data.isVisiblePlayerManager = true;
        setTimeout(() => { thiss.data.isVisiblePopup = true;},10)
    }

    private Close() {
        var thiss = this;
        setTimeout(() => { thiss.data.isVisiblePlayerManager = false; },200)
        this.data.isVisiblePopup = false;
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
       this.CheckPlayerAvailable(() => { }, () => { });
    }

    public CheckPlayerAvailable(ok: () => void, notOk: () => void) {
        var thiss = this;
        fetch("https://asmfun.com/api/ASMFunPlayerInfo.json")
            .then(r => r.json())
            .then(r => {
            thiss.data.latestVersion = r.latestVersion;
            thiss.projectService.GetUserSettings((s) => {
                thiss.data.serverNotConnected = false;
                thiss.data.currentVersion = s.serverVersion;
                if (s.serverVersion != null && s.serverVersion !== thiss.data.latestVersion) {
                    // New version available
                    thiss.data.newVersionAvailable = true;
                    thiss.data.isVisiblePlayerManager = true;
                }
                else {
                    thiss.data.isVisiblePlayerManager = false;
                }
                var svc = thiss.mainData.container.Resolve<ProjectManager>(ProjectManager.ServiceName);
                if (svc != null)
                    svc.LoadOne();
                ok();
            }, () => {
                thiss.data.serverNotConnected = true;
                thiss.data.isVisiblePlayerManager = true;
                notOk();
                this.mainData.appData.alertMessages.Notify("Nope, not running.", NotifyIcon.Alert);
            });
        });
    }

    private SelectOS(osName: string) {
        this.clearOS();
        switch (osName) {
            case "Windows": this.data.isWindows = true; return;
            case "Mac": this.data.isMac = true; return;
            case "Linux": this.data.isLinux = true; return;
        }
        // default value
        this.data.isWindows = true;
    }

    private clearOS() {
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
         else if ( /Linux/.test(platform)) 
            return BrowserTypes.Linux;

        return BrowserTypes.Unknown;
    }

    public static NewData(): IAsmFunIdeData {
        return {
            serverNotConnected: false,
            hasConfirmedLicense: false,
            isLinux: false,
            isMac: false,
            isWindows: false,
            currentVersion: "0.0.0.0",
            newVersionAvailable: false,
            latestVersion: "0.0.0.0",
            isVisiblePlayerManager:false,
            isVisiblePopup:false,
        };
    }

    public static ServiceName: ServiceName = { Name: "ASMFunPlayerManager" };
    
}