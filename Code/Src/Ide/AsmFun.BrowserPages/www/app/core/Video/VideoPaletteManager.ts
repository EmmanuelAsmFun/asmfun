import { IVideoLayerData, IVideoSettings, IVideoManagerData, IVideoPalette, IVideoColor } from "../../data/VideoData.js";
import { ServiceName } from "../../serviceLoc/ServiceName.js";
import { IMemoryDump } from "../../data/ComputerData.js";
import { AsmTools } from "../../Tools.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

export class VideoPaletteManager {
    


    private videoSettings?: IVideoSettings;
    private videoManagerData?: IVideoManagerData;

    public Init(videoManagerData: IVideoManagerData) {
        this.videoSettings = videoManagerData.settings;
        this.videoManagerData = videoManagerData;
    }


    public Parse(memDump: IMemoryDump, data: Uint8Array) {
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
            var r = (((entry >> 8) & 0xf) << 4 | ((entry >> 8) & 0xf));
            var g = (((entry >> 4) & 0xf) << 4 | ((entry >> 4) & 0xf));
            var b = ((entry & 0xf) << 4 | (entry & 0xf));
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