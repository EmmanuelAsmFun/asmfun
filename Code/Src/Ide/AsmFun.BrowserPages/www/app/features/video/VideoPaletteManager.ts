import { IVideoManagerData, IVideoPalette } from "./data/VideoData.js";
import { IMemoryDump } from "../computer/data/ComputerData.js";
import { ColorPalette } from "../palette/ColorPalette.js";
import { AsmTools } from "../../Tools.js";
import { VideoPaletteDumpCommand } from "./commands/VideoCommands.js";
import { NewPalette, IPaletteColor } from "../palette/data/PaletteData.js";
import { IMainData } from "../../framework/data/MainData.js";
import { ServiceName } from "../../framework/serviceLoc/ServiceName.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

export class VideoPaletteManager {
    
    private videoManagerData?: IVideoManagerData;
    private colorPalette: ColorPalette = new ColorPalette();

    public Init(mainData: IMainData, videoManagerData: IVideoManagerData) {
        this.videoManagerData = videoManagerData;
        mainData.commandManager.Subscribe2(new VideoPaletteDumpCommand(), this, x => this.MemoryDump());
        this.colorPalette.Init(videoManagerData.palette.palette);
    }

    public Parse(memDump: IMemoryDump, data: Uint8Array) {
        if (this.videoManagerData == null) return;
        var palette = this.videoManagerData.palette;
        palette.startAddress = AsmTools.numToHex5(memDump.startAddress);
        palette.endAddress = AsmTools.numToHex5(memDump.endAddressForUI);
        this.colorPalette.Parse2ByteColors(data);
    }

    public GetColor(colorIndex: number): IPaletteColor {
        return this.colorPalette.GetColor(colorIndex);
    }

    public MemoryDump() {
        this.colorPalette.MemoryDump();
    }

    public static NewData(): IVideoPalette {
        return {
            palette: NewPalette(),
            startAddress: "",
            endAddress: "",
        };
    }

    public static ServiceName: ServiceName = { Name: "VideoPaletteManager" };
}