// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IAsmFunAppData } from "../data/AsmFunAppData.js"
import { IMainData } from "../data/MainData.js";
import { VideoOpenManagerCommand, VideoReloadAllCommand, VideoEnableAutoReloadCommand, VideoEnableKeyForwardingCommand } from "../data/commands/VideoCommands.js";
import { EditorEnableCommand } from "../data/commands/EditorCommands.js";
import { ComputerService } from "../services/ComputerService.js";
import { IVideoManagerData, NewRamManagerData } from "../data/VideoData.js";
import { VideoLayerManager } from "./Video/VideoLayerManager.js";
import { ServiceName } from "../serviceLoc/ServiceName.js";
import { VideoPaletteManager } from "./Video/VideoPaletteManager.js";
import { VideoSpriteManager } from "./Video/VideoSpriteManager.js";
import { VideoComposerManager } from "./Video/VideoComposerManager.js";
import { DebuggerService } from "../services/DebuggerService.js";
import { ProjectManager } from "./ProjectManager.js";
import { VideoRamManager } from "./Video/VideoRamManager.js";
import { KeyboardManager } from "./KeyboardManager.js";
import { IKeyboardKey } from "../data/ComputerData.js";


export class VideoManager {

    private autoReloader: number = 0; 
    private mainData: IMainData;
    private myAppData: IAsmFunAppData;
    public data: IVideoManagerData;
    public computerService: ComputerService;
    public videoLayerManager: VideoLayerManager;
    public videoPaletteManager: VideoPaletteManager;
    public videoSpriteManager: VideoSpriteManager;
    public videoComposerManager: VideoComposerManager;
    public videoRamManager: VideoRamManager;
    private projectManager: ProjectManager;
    private keyboardManager: KeyboardManager | null = null;

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
        this.videoRamManager = mainData.container.Resolve<VideoRamManager>(VideoRamManager.ServiceName) ?? new VideoRamManager();
        this.projectManager = mainData.container.Resolve<ProjectManager>(ProjectManager.ServiceName) ?? new ProjectManager(this.mainData);
        this.mainData.commandManager.Subscribe2(new VideoOpenManagerCommand(null), this, x => this.OpenManager(x.state));
        this.mainData.commandManager.Subscribe2(new VideoReloadAllCommand(), this, () => this.ReloadData());
        this.mainData.commandManager.Subscribe2(new VideoEnableAutoReloadCommand(null), this, (s) => this.SwapEnableAutoReload(s.state));
        this.mainData.commandManager.Subscribe2(new VideoEnableKeyForwardingCommand(null), this, (s) => this.EnableKeyForwarding(s.state));
        var debugSvc = mainData.container.Resolve<DebuggerService>(DebuggerService.ServiceName) ?? new DebuggerService();
        this.videoLayerManager.Init(this.data, debugSvc,this.projectManager);
        this.videoRamManager.Init(mainData, this.data, debugSvc,this.projectManager);
        this.videoPaletteManager.Init(mainData,this.data);
        this.videoSpriteManager.Init(this.data, debugSvc, () => this.ReloadData(), this.projectManager);
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
                    case "Layer1": thiss.videoLayerManager.Parse(0, memDump, numBytes); break;
                    case "Layer2": thiss.videoLayerManager.Parse(1, memDump, numBytes); break;
                    case "VideoRAM":
                        thiss.videoRamManager.Parse(memDump,numBytes);
                        ram = numBytes; break;
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
        this.keyboardManager = this.mainData.container.Resolve<KeyboardManager>(KeyboardManager.ServiceName);
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
        if (this.videoLayerManager != null) this.videoLayerManager.StorePreviousLayerInfo();
        setTimeout(() => { thiss.data.isVisible = false; }, 200)
        this.data.isVisiblePopup = false;
        this.EnableKeyForwarding(false);
    }

    

    public SwapEnableAutoReload(state: boolean | null) {
        var newState = state != null ? state : !this.data.isEnableAutoReload;
        if (this.autoReloader != 0)
            clearInterval(this.autoReloader);
        if (newState) {
            if (this.data.intervalTime < 50)
                this.data.intervalTime = 50;
            this.autoReloader = setInterval(() => this.ReloadData(), this.data.intervalTime);
        }
        this.data.isEnableAutoReload = newState;
    }

    public EnableKeyForwarding(state: boolean | null) {
        if (this.keyboardManager == null) return;
        var newState = state != null ? state : !this.keyboardManager.isEnabled;
        this.keyboardManager.isEnabled = newState;
        this.data.isKeyboardForwarded = newState;
        if (newState)
            this.SwapEnableAutoReload(true);
        else if (this.data.isEnableAutoReload)
            this.SwapEnableAutoReload(false);
    }

    public KeyUp(keyy: IKeyboardKey): any {
        if (!this.data.isKeyboardForwarded) return true;
        //this.computerService.KeyUp(keyy, () => { });
        return this.keyboardManager?.KeyUp(keyy);
    }
    public KeyDown(keyy: IKeyboardKey): any {
        if (!this.data.isKeyboardForwarded) return true;
        //this.computerService.KeyDown(keyy, () => { });
        return this.keyboardManager?.KeyDown(keyy);
    }

    public static NewData(): IVideoManagerData {
        return {
            isVisible: false,
            isVisiblePopup: false,
            isEnableAutoReload: false,
            isKeyboardForwarded: false,
            intervalTime: 500,
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
            ram: NewRamManagerData(),
        };
    }

    public static ServiceName: ServiceName = { Name: "VideoManager" };
}
