import {IVideoSettings, IVideoManagerData, IRamManagerData
} from "../../data/VideoData.js";
import { ServiceName } from "../../serviceLoc/ServiceName.js";
import { IMemoryDump } from "../../data/ComputerData.js";
import { AsmTools, ASMStorage } from "../../Tools.js";
import { VideoPaletteManager } from "./VideoPaletteManager.js";
import { DebuggerService } from "../../services/DebuggerService.js";
import { ProjectManager } from "../ProjectManager.js";
import { VideoMemoryDumpCommand, VideoShowMemoryHexCommand } from "../../data/commands/VideoCommands.js";
import { IMainData } from "../../data/MainData.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

export class VideoRamManager {
    private static StorageLayerData = "StorageRamData";
    private videoSettings?: IVideoSettings;
    private videoManagerData?: IVideoManagerData;
    private debuggerService?: DebuggerService;
    private projectManager?: ProjectManager;
    private data?: IRamManagerData;
    private ram?: Uint8Array;

    public Init(mainData: IMainData,videoManagerData: IVideoManagerData, debuggerService: DebuggerService, projectManager: ProjectManager) {
        this.videoSettings = videoManagerData.settings;
        this.videoManagerData = videoManagerData;
        this.debuggerService = debuggerService;
        this.projectManager = projectManager;
        this.data = videoManagerData.ram;
        mainData.commandManager.Subscribe2(new VideoMemoryDumpCommand(), this, x => this.VideoMemoryDump());
        mainData.commandManager.Subscribe2(new VideoShowMemoryHexCommand(null), this, x => this.ShowMemoryHex(x.state));
    }

    public Parse(memDump: IMemoryDump, data: Uint8Array) {
        if (this.data == null) return;
        this.data.startAddress = AsmTools.numToHex5(memDump.startAddress);
        this.data.endAddress = AsmTools.numToHex5(memDump.endAddressForUI);
        this.ram = data;
        if (this.data.showHex)
            this.data.hexData = this.MakeHexString();
    }

    private ShowMemoryHex(state: boolean | null) {
        if (this.data == null) return;
        if (state == null)
            this.data.showHex = !this.data.showHex;
        else
            this.data.showHex = state;
        if (this.data.showHex)
            this.data.hexData = this.MakeHexString();
    }

    private MakeHexString():string {
        if (this.ram == null) return "";
        var returnData = "";
        var writer = "";
        var insertAddress = true;
        var hasWrittenOnlyZero = true;
        var wasWrittenZero = false;
        for (var i = 0; i < this.ram.length; i++) {

            if (insertAddress) {
                insertAddress = false;
                writer += "<span class=\"addr\">0x"+AsmTools.numToHex5(i) +"</span> &nbsp";
            }
            var numm = this.ram[i];
            if (numm > 0) {
                hasWrittenOnlyZero = false;
                wasWrittenZero = false;
            }
            var num = numm.toString(16);
            num = "0".repeat(2 - num.length) + num;
            writer += "" + num + " ";
            if (((i + 1) % 8) === 0) writer += " &nbsp;";
            if (((i + 1) % 64) === 0) {
                insertAddress = true;
                writer += " <br />";
            }
            if (((i + 1) % 512) === 0) {
                if (!hasWrittenOnlyZero) {
                    writer += " <br />";
                    returnData += writer;
                } else {
                    if (!wasWrittenZero)
                        returnData += "... 0x00 ... (Only Zero's) <br /><br />";
                    wasWrittenZero = true;
                }

                writer = "";
                hasWrittenOnlyZero = true;
            }
        }
        return returnData;
    }


    public VideoMemoryDump() {
        ASMStorage.SaveDataToFile(this.ram, "VideoRam_" + ASMStorage.GetNowForFile())
    }
    

    public static ServiceName: ServiceName = { Name: "VideoRamManager" };
}