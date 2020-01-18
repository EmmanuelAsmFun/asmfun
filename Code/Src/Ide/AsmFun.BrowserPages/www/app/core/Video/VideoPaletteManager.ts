import { IVideoLayerData, IVideoSettings, IVideoManagerData, IVideoPalette, IVideoColor } from "../../data/VideoData.js";
import { ServiceName } from "../../serviceLoc/ServiceName.js";
import { IMemoryDump } from "../../data/ComputerData.js";
import { AsmTools, ASMStorage } from "../../Tools.js";
import { IMainData } from "../../data/MainData.js";
import { VideoPaletteDumpCommand } from "../../data/commands/VideoCommands.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

export class VideoPaletteManager {
    
    private rawData?: Uint8Array;

    private videoSettings?: IVideoSettings;
    private videoManagerData?: IVideoManagerData;

    public Init(mainData: IMainData, videoManagerData: IVideoManagerData) {
        this.videoSettings = videoManagerData.settings;
        this.videoManagerData = videoManagerData;
        mainData.commandManager.Subscribe2(new VideoPaletteDumpCommand(), this, x => this.MemoryDump());
    }


    public Parse(memDump: IMemoryDump, data: Uint8Array) {
        this.rawData = data;
        var paletteData = this.RefreshPalette(data);
        if (this.videoManagerData == null) return;
        var palette = this.videoManagerData.palette;
        palette.startAddress = AsmTools.numToHex5(memDump.startAddress);
        palette.endAddress = AsmTools.numToHex5(memDump.endAddressForUI);
        palette.colors = paletteData;
        palette.changeColor = c => {palette.selectedColor = c; }
    }

    private RefreshPalette(data: Uint8Array): IVideoColor[] {
        var entries: IVideoColor[] = [];
        for (var i = 0; i < data.length; i += 2) {
            var byte1: number = data[i];
            var byte2: number = data[i +1];
            var entry: number = byte1 << 4 | byte2;
            var g = (((entry >> 8) & 0xf) << 4 | ((entry >> 8) & 0xf));
            var b = (((entry >> 4) & 0xf) << 4 | ((entry >> 4) & 0xf));
            var r = ((entry & 0xf) << 4 | (entry & 0xf));
            var numColor = (r << 16) | (g << 8) | (b);
            entries.push({
                colorNumber: numColor,
                colorRGB: r + "," + g + "," + b,
                colorHex: "#" + AsmTools.numToHex5(numColor),
                r: r, g: g, b: b,
                index:(i/2),
            });
        }
        return entries;
    }

    public static NewEmptyColor(): IVideoColor {
        return { colorHex: "#000000", colorNumber: 0, colorRGB: "0,0,0",r:0,g:0,b:0,index:0 };
    }

    public GetColor(colorIndex: number): IVideoColor {
        if (this.videoManagerData == null) return VideoPaletteManager.NewEmptyColor();
        return this.videoManagerData.palette.colors[colorIndex];
    }

    public MemoryDump() {
        if (this.rawData == null) return;
        ASMStorage.SaveDataToFile(this.rawData, "Palette_" + ASMStorage.GetNowForFile())
    }


    public static NewData(): IVideoPalette {
        return {
            colors: [],
            selectedColor: null,
            startAddress: "",
            endAddress: "",
            changeColor: () => { },
        };
    }
    public static ServiceName: ServiceName = { Name: "VideoPaletteManager" };
}