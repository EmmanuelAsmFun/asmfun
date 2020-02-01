﻿import {IVideoSettings, IVideoManagerData, IRamManagerData, IVideoLayerData
} from "../../data/VideoData.js";
import { ServiceName } from "../../serviceLoc/ServiceName.js";
import { IMemoryDump } from "../../data/ComputerData.js";
import { AsmTools, ASMStorage } from "../../Tools.js";
import { VideoPaletteManager } from "./VideoPaletteManager.js";
import { DebuggerService } from "../../services/DebuggerService.js";
import { ProjectManager } from "../ProjectManager.js";
import { VideoMemoryDumpCommand, VideoShowMemoryHexCommand } from "../../data/commands/VideoCommands.js";
import { IMainData } from "../../data/MainData.js";
import { ComputerService } from "../../services/ComputerService.js";

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
    private computerService?: ComputerService;
    private data?: IRamManagerData;
    private ram?: Uint8Array;
    private blockStartAddresses: number[] = [];
    private blockEndAddresses: number[] = [];
    private lastLayers: IVideoLayerData[] | null = null;

    public Init(mainData: IMainData, videoManagerData: IVideoManagerData, debuggerService: DebuggerService, projectManager: ProjectManager,
                                    computerService: ComputerService) {
        this.videoSettings = videoManagerData.settings;
        this.videoManagerData = videoManagerData;
        this.debuggerService = debuggerService;
        this.projectManager = projectManager;
        this.computerService = computerService;
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
            this.ShowData();
    }

    public ParseLayers(layers: IVideoLayerData[]) {
        this.lastLayers = layers;
    }


    public ShowData() {
        if (this.computerService == null) return;
        this.computerService.GetLoadedMemoryBlocks(r => {
            if (this.data == null) return;
            r = r.filter(x => x.memoryType == 6); // type Video = 6
            if (this.lastLayers != null && this.lastLayers.length == 2) {
                if (this.lastLayers[0].IsEnabled) {
                    r.push(this.ConvertLayerToMemBlock(this.lastLayers[0]));
                    r.push(this.ConvertLayerTileToMemBlock(this.lastLayers[0]));
                }
                if (this.lastLayers[1].IsEnabled) {
                    r.push(this.ConvertLayerToMemBlock(this.lastLayers[1]));
                    r.push(this.ConvertLayerTileToMemBlock(this.lastLayers[1]));
                }
               
            }
            this.blockStartAddresses = r.map(x => x.startAddress);
            this.blockEndAddresses = r.map(x => x.endAddress);
            this.data.memoryBlocks = r;
            this.data.hexData = this.MakeHexString();
        });
    }
    private ConvertLayerToMemBlock(layer: IVideoLayerData): IMemoryDump {
        return {
            data: "",
            startAddress: layer.MapBase,
            endAddress: layer.MapBase + layer.LayerWidth * layer.LayerHeight,
            endAddressForUI: 0,
            memoryType: 6,
            name: "Layer Map " + (layer.LayerIndex +1),
        };
    }
    private ConvertLayerTileToMemBlock(layer: IVideoLayerData): IMemoryDump {
        var data = {
            data: "",
            startAddress: layer.TileBase,
            endAddress: layer.TileBase + layer.TileWidth * layer.TileHeight * (layer.BitsPerPixel / 8) * 256,
            endAddressForUI: 0,
            memoryType: 6,
            name: "Layer Tiles " + (layer.LayerIndex +1),
        };
        data.endAddressForUI = data.endAddress;
        return data;
    }

    private ShowMemoryHex(state: boolean | null) {
        if (this.data == null) return;
        if (state == null)
            this.data.showHex = !this.data.showHex;
        else
            this.data.showHex = state;
        if (this.data.showHex)
            this.ShowData();
    }

    private MakeHexString():string {
        if (this.ram == null) return "";
        var returnData = "";
        var writer = "";
        var insertAddress = true;
        var hasWrittenOnlyZero = true;
        var wasWrittenZero = false;
        if (this.data == null) return "";
        for (var i = 0; i < this.ram.length; i++) {
            var startIndex = this.blockStartAddresses.indexOf(i);
            if (startIndex > -1) {
                var block = this.data.memoryBlocks[startIndex];
                writer += "<div class=\"addr-start-region\">Start 0x" + AsmTools.numToHex5(block.startAddress) + "-0x" + AsmTools.numToHex5(block.endAddress) + " " + block.name + "</div>";
                hasWrittenOnlyZero = false;
            } else {
                var startIndex = this.blockEndAddresses.indexOf(i);
                if (startIndex > -1) {
                    var block = this.data.memoryBlocks[startIndex];
                    writer += "<div class=\"addr-end-region\">End 0x" + AsmTools.numToHex5(block.startAddress) + "-0x" + AsmTools.numToHex5(block.endAddress) + " " + block.name + "</div>";
                    hasWrittenOnlyZero = false;
                }
            }
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
        ASMStorage.SaveDataToFile(this.ram, "VideoRam_" + ASMStorage.GetNowForFile() + ".bin");
    }
    

    public static ServiceName: ServiceName = { Name: "VideoRamManager" };
}