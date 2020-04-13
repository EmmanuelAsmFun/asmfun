import { IPaletteData, IPaletteColor } from "../../../features/palette/data/PaletteData.js";
import { IPopupWindowData } from "../../../framework/data/IPopupData.js";
// #region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
// #endregion
export interface IDragableElement {
    X: number;
    Y: number;
}


export interface IVideoManagerData extends IPopupWindowData {
    isVisible: boolean;
    isVisiblePopup: boolean;
    isEnableAutoReload: boolean;
    isKeyboardForwarded: boolean;
    intervalTime: number;
    settings: IVideoSettings;
    palette: IVideoPalette;
    layers: IVideoLayerData[]
    spriteDatas: ISpritesData;
    composer: IVideoDisplayComposer;
    ram: IRamManagerData;
    
}

export interface IVideoLayerData extends IDragableElement {
    ColorDepth: number;
    RawDataString: string;
    IsEnabled: boolean;

    Mode: number;
    ModeString: string;
    MapBase: number;
    MapBaseHex: string;
    TileBase: number;
    TileBaseHex: string;
    TileSize: number;

    TextMode: boolean;
    TextMode256c: boolean;
    TileMode: boolean;
    BitmapMode: boolean;

    HorizontalScroll: number;
    VerticalScroll: number;

    MapWidth: number;
    MapWidthMax: number;
    MapHeight: number;
    MapHeightMax: number;

    TileWidth: number;
    TileWidthMax: number;
    TileHeight: number;
    TileHeightMax: number;

    LayerWidth: number;
    LayerWidthMax: number;
    LayerHeight: number;
    LayerHeightMax: number;

    BitsPerPixel: number;
    PaletteOffset: number;

    LayerIndex: number;

    min_eff_x: number;
    max_eff_x: number;
    name: string;
    startAddress: string;
    endAddress: string;

    valueChanged: (v) => void;
    IsEnabledChanged: (v) => void;
    VideoLayerScoll: (evt,obj) => void;
    CopyToClipBoard: () => void;
    SelectTileByImage: (e) => void;
    selectedTileIndex: number;
    Modes: string[];
    Show: boolean;
    ShowPreview: boolean;
    ShowFull: boolean;
}
export function NewVideoLayer(layerIndex:number): IVideoLayerData {
    return {
        ColorDepth:0,
        BitmapMode: false,
        BitsPerPixel: 0,
        HorizontalScroll: 0,
        IsEnabled: false,
        LayerHeight: 0,
        LayerWidth: 0,
        LayerHeightMax: 0,
        LayerIndex: layerIndex,
        LayerWidthMax: 0,
        MapBase: 0,
        MapBaseHex: "",
        MapHeight: 0,
        MapHeightMax: 0,
        MapWidth: 0,
        MapWidthMax: 0,
        max_eff_x: 0,
        min_eff_x: 0,
        Mode: 0,
        ModeString: "",
        PaletteOffset: 0,
        TextMode: false,
        TextMode256c: false,
        TileBase: 0,
        TileBaseHex: "",
        TileHeight: 0,
        TileHeightMax: 0,
        TileMode: false,
        TileSize: 0,
        TileWidth: 0,
        TileWidthMax: 0,
        VerticalScroll: 0,
        name: "",
        startAddress: "",
        endAddress: "",
        RawDataString: "",
        valueChanged: () => { },
        IsEnabledChanged: () => { },
        VideoLayerScoll: (evt, obj) => { },
        CopyToClipBoard: () => { },
        SelectTileByImage: (e) => { },
        selectedTileIndex: 0,
        Modes: [],
        Show: true,
        ShowFull: true,
        ShowPreview: true,
        X: 0,
        Y:0,
    };
}
export enum LayerModes {
    Text_16_color_1 = 0 ,
    Text_256_color_1 = 1 ,
    TileMode_2 = 2,
    TileMode_4 = 3,
    TileMode_8 = 4,
    BitmapMode_2 = 5,
    BitmapMode_4 = 6,
    BitmapMode_8 = 7,
}

export interface IVideoSettings {
    Width: number;
    Height: number;
    PaletteSize: number;
    VideoRAMSize: number;
    NumberOfLayers: number;
    NumberOfSprites: number;
}


export interface IVideoPalette {
    palette: IPaletteData;
    startAddress: string;
    endAddress: string;
}

export interface ISpritesData {
    IsEnabled: boolean;
    sprites: IVideoSpriteProperties[];
    selectedSprite: IVideoSpriteProperties | null;
    selectedSpriteIndex: number;
    startAddress: string;
    endAddress: string;
    changeSprite: (delta: number) => void;
    selectByImage: (evt:MouseEvent) => void;
}


export enum X16SpriteModes {
    Bpp4 = 0,
    Bpp8 = 1,
}
export interface IVideoSpriteProperties extends IDragableElement{
    
    /**
     * Sprite Disabled = 0,
     * Sprite Between BG And Layer0 = 1,
     * Sprite Between Layer0 And Layer1 = 2,
     * Sprite In Front Of Layer1 = 3,
     */
    ZDepth: number;
    Width: number;
    Height: number;
    HFlip: boolean;
    VFlip: boolean;
    Mode: X16SpriteModes;
    Modes: X16SpriteModes[];
    ModeString:string,
    Bpp:number,
    SpriteIndex: number;
    SpriteAddress: number;
    SpriteAddressHex: string;
    SpriteEndAddress: number;
    SpriteEndAddressHex: string;
    PaletteOffset: number;
    CollisionMask: number;
    name: string;
    RawDataString: string;
    select: (IVideoSpriteProperties) => void;

    valueChanged: (v) => void;
    CopyToClipBoard: () => void;
    
}

export enum HScales {
    HorizontalScale_1_1 = 128,
    HorizontalScale_2_1 = 64,
    HorizontalScale_4_1 = 32,
    HorizontalScale_8_1 = 16,
    HorizontalScale_16_1 = 8,
    HorizontalScale_32_1 = 4,
    HorizontalScale_64_1 = 2 | 1,
}
export enum VScales {
    VerticalScale_1_1 = 128,
    VerticalScale_2_1 = 64,
    VerticalScale_4_1 = 32,
    VerticalScale_8_1 = 16,
    VerticalScale_16_1 = 8 | 4 | 2 | 1,
}
export enum VideoOutModes {
    DisabledVideo,
    VGA,
    NTSC
}
export interface IVideoDisplayComposer {
    RawDataString: string;
    startAddress: string;
    endAddress: string;
    /**$0F:$0001 :Horizontal Scale */
    b_HScale: number;
    /**$0F:$0002 :Vertical Scale */
    b_VScale: number;
    OutMode: VideoOutModes;
    OutModeString: string;
    OutModeVG: number;
    ChromaDisable: boolean;
    HScale: number;
    HScaleString: string;
    VScale: number;
    VScaleString: string;
    /**This value contains the index into palette memory for the display border. If the Output mode is set to 0, this is ignored. */
    BorderColor: number;
    BorderColorData: IPaletteColor;
    HStart: number;
    HStop: number;
    VStart: number;
    VStop: number;
    StepXAdvance: number;
    FrontPorch: number;
    IrqLine: number;

    valueChanged: (v) => void;
    OutModes: VideoOutModes[]
    HScales: HScales[]
    VScales: VScales[]
    CopyToClipBoard: () => void;
}

export interface IVideoRenderLineContext {
    mapAddress: number;
    width: number;
    y: number;
    layer: IVideoLayerData;
    size: number;
    map_addr_begin: number;
    map_addr_end: number;
    tile_bytes: Uint8Array;
    ram: Uint8Array;
}
export function NewContext(ram: Uint8Array, layer: IVideoLayerData, w: number): IVideoRenderLineContext {
    return {
        ram: ram,
        layer: layer,
        map_addr_begin: 0,
        map_addr_end: 0,
        size: 0,
        tile_bytes: new Uint8Array(0),
        width: w,
        y: 0,
        mapAddress: 0,
    }
};
export interface IVideoMapTile {
    ForegroundColor: number;
    BackgroundColor: number;
    VerticalFlip: boolean;
    HorizontalFlip: boolean;
    PaletteOffset: number;
    TileIndex: number;
}
export function NewTile(): IVideoMapTile {
    return {
        BackgroundColor: 0,
        ForegroundColor: 0,
        HorizontalFlip: false,
        VerticalFlip: false,
        PaletteOffset: 0,
        TileIndex: 0,
    }
}

export interface IVideoLayerManagerData {
    Layers: IVideoLayerStore[];
}
export interface IVideoLayerStore {
    Show: boolean,
    ShowFull: boolean,
    ShowPreview: boolean,
}
export function NewVideoLayerManagerData(): IVideoLayerManagerData {
    return {
        Layers:[ {
            Show: true,
            ShowFull: true,
            ShowPreview: true,
        }, {
                Show: true,
                ShowFull: true,
                ShowPreview: true,
            }
            ]
    };
}


export interface IRamManagerData {
    startAddress: string;
    endAddress: string;
    hexData: string;
    showHex: boolean;
    memoryBlocks: IMemoryDump[];
}
export function NewRamManagerData(): IRamManagerData{
    return {
        startAddress: "",
        endAddress:"",
        hexData: "",
        showHex: false,
        memoryBlocks:[],
    }
}


export interface IMemoryDump {
    startAddress: number;
    endAddress: number;
    endAddressForUI: number;
    name: string;
    data: string;
    memoryType: number;
}