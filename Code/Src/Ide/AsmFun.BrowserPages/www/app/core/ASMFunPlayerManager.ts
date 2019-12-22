// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { IAsmFunAppData, IAsmFunIdeData } from "../data/AsmFunAppData.js"
import { IMainData } from "../data/MainData.js";
import { ProjectService } from "../services/projectService.js";
import { ApiService } from "../services/ApiService.js";
import { ConfirmIcon, NotifyIcon } from "../common/Enums.js";
import { ServiceName } from "../serviceLoc/ServiceName.js";
import { ProjectManager } from "./ProjectManager.js";


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
    }
    public Launch() {
        this.mainData.appData.alertMessages.Confirm("Under construction",
            "<img width=\"140\" src=\"/images/avatar/emmanuel/emmanuel-start-fixin.gif\" style=\"float:left;margin: 20px 5px 40px -10px;\" />"
            + "Dear visitor,<br /><br /> This is a sneak preview. "
            + "There are probably some unknown bugs, use CTRL-S to save at regular times. This saves and creates a backup. "
            + "You can play around and have some fun with the IDE.<br /><br />Emmanuel"
            + "", ConfirmIcon.OK, () => {

        });
       this.CheckPlayerAvailable(() => { }, () => { });
    }

    public CheckPlayerAvailable(ok: () => void, notOk: () => void) {
        var thiss = this;
        this.projectService.GetUserSettings(() => {
            thiss.data.serverNotConnected = false;
            var svc = thiss.mainData.container.Resolve<ProjectManager>(ProjectManager.ServiceName);
            if (svc != null)
                svc.LoadOne();
            ok();
        }, () => {
                thiss.data.serverNotConnected = true;
                notOk();
                this.mainData.appData.alertMessages.Notify("Nope, not running.", NotifyIcon.Alert);
        });
    }


    public static ServiceName: ServiceName = { Name: "ASMFunPlayerManager" };
    
}