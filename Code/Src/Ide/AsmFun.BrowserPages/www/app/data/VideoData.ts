

// #region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
// #endregion


export interface IVideoManagerData {
    isVisible: boolean;
    isVisiblePopup: boolean;
    settings: IVideoSettings;
    palette: IVideoPalette;
    layers: IVideoLayerData[]
    spriteDatas: ISpritesData;
    composer: IVideoDisplayComposer;
}

export interface IVideoLayerData {
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
    colors: IVideoColor[];
    selectedColor: IVideoColor | null;
    startAddress: string;
    endAddress: string;
    changeColor: (color: IVideoColor) => void;
}
export interface IVideoColor {
    colorNumber: number;
    colorRGB: string;
    colorHex: string;
    r:number,g:number,b:number,
}
export interface ISpritesData {
    sprites: IVideoSpriteProperties[];
    selectedSprite: IVideoSpriteProperties | null;
    selectedSpriteIndex: number;
    startAddress: string;
    endAddress: string;
    changeSprite: (delta: number) => void;
    selectByImage: (evt:MouseEvent) => void;
}


export enum X16SpriteMode {
    Bpp4 = 0,
    Bpp8 = 1,
}
export interface IVideoSpriteProperties {
    /**
     * Sprite Disabled = 0,
     * Sprite Between BG And Layer0 = 1,
     * Sprite Between Layer0 And Layer1 = 2,
     * Sprite In Front Of Layer1 = 3,
     */
    ZDepth: number;
    X: number;
    Y: number;
    Width: number;
    Height: number;
    HFlip: boolean;
    VFlip: boolean;
    Mode: X16SpriteMode;
    ModeString:string,
    Bpp:number,
    SpriteAddress: number;
    SpriteAddressHex: string;
    palette_offset: number;
    CollisionMask: number;
    name: string;
    RawDataString: string;
    select: (IVideoSpriteProperties) => void;
    
}

export enum HScales {
    HorizontalScale_1_1,
    HorizontalScale_2_1,
    HorizontalScale_4_1,
    HorizontalScale_8_1,
    HorizontalScale_16_1,
    HorizontalScale_32_1,
    HorizontalScale_64_1,
}
export enum VScales {
    VerticalScale_1_1,
    VerticalScale_2_1,
    VerticalScale_4_1,
    VerticalScale_8_1,
    VerticalScale_16_1,
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
    BorderColorData: IVideoColor;
    HStart: number;
    HStop: number;
    VStart: number;
    VStop: number;
    StepXAdvance: number;
    FrontPorch: number;
    IrqLine: number;

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
export interface IVideoMapTile {
    ForegroundColor: number;
    BackgroundColor: number;
    VerticalFlip: boolean;
    HorizontalFlip: boolean;
    PaletteOffset: number;
    TileIndex: number;
}