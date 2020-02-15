import { ICommandManager } from "../../framework/ICommandManager.js";
import { IFeatureFactory } from "../../framework/IFeatureFactory.js";
import * as VideoMethods from "./VideoMethods.js";
import { VideoManager } from "./VideoManager.js";
import { VideoSpriteManager } from "./VideoSpriteManager.js";
import { VideoPaletteManager } from "./VideoPaletteManager.js";
import { VideoComposerManager } from "./VideoComposerManager.js";
import { SpritesManager } from "./SpritesManager.js";
import { VideoRamManager } from "./VideoRamManager.js";
import { VideoLayerManager } from "./VideoLayerManager.js";
import { IServiceResolverFactory } from "../../framework/serviceLoc/IServiceResolver.js";
import { IMainData } from "../../framework/data/MainData.js";
import { ServiceLifestyle } from "../../framework/serviceLoc/ServiceName.js";

export var UIDataName = "videoManager";
export var UIDataNameSprites = "spritesManager";

export class VideoFactory implements IFeatureFactory {

    private container?: IServiceResolverFactory | null;

    public GetUIData(data: any): any {
        data[UIDataNameSprites] = SpritesManager.NewData();
        return VideoManager.NewData();
    }

    public PreRegister() { }

    public RegisterServices(container: IServiceResolverFactory, mainData: IMainData) {
        this.container = container;
        VideoMethods.SetCommandManager(mainData.commandManager);
        // Video
        this.container.AddWithConstructor<VideoManager>(VideoManager.ServiceName, () => new VideoManager(mainData)).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<VideoLayerManager>(VideoLayerManager.ServiceName, () => new VideoLayerManager()).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<VideoPaletteManager>(VideoPaletteManager.ServiceName, () => new VideoPaletteManager()).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<VideoSpriteManager>(VideoSpriteManager.ServiceName, () => new VideoSpriteManager()).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<VideoComposerManager>(VideoComposerManager.ServiceName, () => new VideoComposerManager()).WithLifestyle(ServiceLifestyle.Singleton);
        this.container.AddWithConstructor<VideoRamManager>(VideoRamManager.ServiceName, () => new VideoRamManager()).WithLifestyle(ServiceLifestyle.Singleton);
    }

    public PreInit() {

    }

    public Init() {
        if (this.container == null) return;
        this.container.Resolve<VideoManager>(VideoManager.ServiceName);
        this.container.Resolve<SpritesManager>(SpritesManager.ServiceName);
    }

    public Start() {

    }

    public GetDependecies() {
        return ["ASMFun.Palette"];
    }

    public GetName() {
        return "ASMFun.Video";
    }

    public GetUIDataName() {
        return UIDataName;
    }

    public GetMethods(): any {
        return VideoMethods;
    }

}