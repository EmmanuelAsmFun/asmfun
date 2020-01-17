// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IAsmFunAppData } from "../data/AsmFunAppData.js"
import { IMainData } from "../data/MainData.js";
import { VideoOpenManagerCommand, VideoReloadAllCommand } from "../data/commands/VideoCommands.js";
import { EditorEnableCommand } from "../data/commands/EditorCommands.js";
import { ComputerService } from "../services/ComputerService.js";
import { IVideoManagerData } from "../data/VideoData.js";
import { VideoLayerManager } from "./Video/VideoLayerManager.js";
import { ServiceName } from "../serviceLoc/ServiceName.js";
import { VideoPaletteManager } from "./Video/VideoPaletteManager.js";
import { VideoSpriteManager } from "./Video/VideoSpriteManager.js";
import { VideoComposerManager } from "./Video/VideoComposerManager.js";
import { DebuggerService } from "../services/DebuggerService.js";


export class VideoManager {

    private mainData: IMainData;
    private myAppData: IAsmFunAppData;
    public data: IVideoManagerData;
    public computerService: ComputerService;
    public videoLayerManager: VideoLayerManager;
    public videoPaletteManager: VideoPaletteManager;
    public videoSpriteManager: VideoSpriteManager;
    public videoComposerManager: VideoComposerManager;

    constructor(mainData: IMainData) {
        var thiss = this;
        this.mainData = mainData;
        this.data = this.mainData.appData.videoManager;
        this.myAppData = mainData.appData;
        this.computerService = mainData.container.Resolve<ComputerService>(ComputerService.ServiceName) ?? new ComputerService();
        this.videoLayerManager = mainData.container.Resolve<VideoLayerManager>(VideoLayerManager.ServiceName) ?? new VideoLayerManager();
        this.videoPaletteManager = mainData.container.Resolve<VideoPaletteManager>(VideoPaletteManager.ServiceName) ?? new VideoPaletteManager();
        this.videoSpriteManager = mainData.container.Resolve<VideoSpriteManager>(VideoSpriteManager.ServiceName) ?? new VideoSpriteManager();
        this.videoComposerManager = mainData.container.Resolve<VideoComposerManager>(VideoComposerManager.ServiceName) ?? new VideoComposerManager();
        this.mainData.commandManager.Subscribe2(new VideoOpenManagerCommand(null), this, x => this.OpenManager(x.state));
        this.mainData.commandManager.Subscribe2(new VideoReloadAllCommand(), this, () => this.ReloadData());
        var debugSvc = mainData.container.Resolve<DebuggerService>(DebuggerService.ServiceName) ?? new DebuggerService();
        this.videoLayerManager.Init(this.data, debugSvc);
        this.videoPaletteManager.Init(this.data);
        this.videoSpriteManager.Init(this.data, debugSvc, () => this.ReloadData());
        this.videoComposerManager.Init(this.data, debugSvc);
    }

    public ReloadData() {
        var thiss = this;
        this.computerService.VideoMemoryDump((r) => {
            if (r == null) return;
            thiss.data.layers = [];
            var ram: Uint8Array = new Uint8Array([]);
            for (var i = 0; i < r.length; i++) {
                var memDump = r[i];
                var numBytes = Uint8Array.from(atob(memDump.data), c => c.charCodeAt(0))
                switch (memDump.name) {
                    case "Composer": thiss.videoComposerManager.Parse(memDump, numBytes, this.videoPaletteManager); break;
                    case "Palette": thiss.videoPaletteManager.Parse(memDump, numBytes); break;
                    case "SpriteAttributes": this.videoSpriteManager.Parse(memDump, numBytes); break;
                    case "Layer1": 
                    case "Layer2": thiss.videoLayerManager.Parse(memDump, numBytes); break;
                    case "VideoRAM": ram = numBytes; break;
                }
            }
            // fill composer border color
            if (thiss.data.composer != null) {
                if (thiss.data.composer.BorderColor > 0)
                    thiss.data.composer.BorderColorData = thiss.videoPaletteManager.GetColor(thiss.data.composer.BorderColor);

                if (ram != null) {
                    thiss.videoSpriteManager.DrawSprites(ram, thiss.videoPaletteManager);
                    thiss.videoLayerManager.RenderLayer(ram, thiss.data.layers[0], thiss.videoPaletteManager);
                    thiss.videoLayerManager.RenderLayer(ram, thiss.data.layers[1], thiss.videoPaletteManager);
                }
            }
        });
    }


    private OpenManager(state: boolean | null) {
        if (state == null)
            state = !this.data.isVisible;
        if (state === this.data.isVisible) return;
        if (!state)
            this.Close();
        else
            this.Open();
    }


    private Open() {
        var thiss = this;
        this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(false));
        thiss.Show();
        this.ReloadData();
        this.videoSpriteManager.Reset();
    }
    private Close() {
        this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(true));
        this.Hide();
    }
    private Show() {
        var thiss = this;
        this.data.isVisible = true;
        setTimeout(() => { thiss.data.isVisiblePopup = true; }, 10)
    }
    private Hide() {
        var thiss = this;
        setTimeout(() => { thiss.data.isVisible = false; }, 200)
        this.data.isVisiblePopup = false;
    }

   

    public static NewData(): IVideoManagerData {
        return {
            isVisible: false,
            isVisiblePopup: false,
            settings: {
                Height: 480,
                Width: 640,
                NumberOfLayers: 2,
                NumberOfSprites: 128,
                PaletteSize: 256 * 2,
                VideoRAMSize: 0x20000,
            },
            layers: [],
            palette: VideoPaletteManager.NewData(),
            spriteDatas: VideoSpriteManager.NewData(),
            composer: VideoComposerManager.NewData(),
        };
    }

    public static ServiceName: ServiceName = { Name: "VideoManager" };
}
