import { IVideoManagerData, IVideoPalette } from "../../data/VideoData.js";
import { ServiceName } from "../../serviceLoc/ServiceName.js";
import { IMemoryDump } from "../../data/ComputerData.js";
import { PainterPalette } from "../painter/PainterPalette.js";
import { AsmTools } from "../../Tools.js";
import { IMainData } from "../../data/MainData.js";
import { VideoPaletteDumpCommand } from "../../data/commands/VideoCommands.js";
import { NewPalette, IPaletteColor } from "../../data/PaletteData.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

export class VideoPaletteManager {
    
    private videoManagerData?: IVideoManagerData;
    private painterPalette: PainterPalette = new PainterPalette();

    public Init(mainData: IMainData, videoManagerData: IVideoManagerData) {
        this.videoManagerData = videoManagerData;
        mainData.commandManager.Subscribe2(new VideoPaletteDumpCommand(), this, x => this.MemoryDump());
        this.painterPalette.Init(videoManagerData.palette.palette);
    }

    public Parse(memDump: IMemoryDump, data: Uint8Array) {
        if (this.videoManagerData == null) return;
        var palette = this.videoManagerData.palette;
        palette.startAddress = AsmTools.numToHex5(memDump.startAddress);
        palette.endAddress = AsmTools.numToHex5(memDump.endAddressForUI);
        this.painterPalette.Parse2ByteColors(data);
    }

    public GetColor(colorIndex: number): IPaletteColor {
        return this.painterPalette.GetColor(colorIndex);
    }

    public MemoryDump() {
        this.painterPalette.MemoryDump();
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