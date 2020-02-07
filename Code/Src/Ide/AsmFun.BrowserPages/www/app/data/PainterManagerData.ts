import { NewPalette, IPaletteData } from "./PaletteData.js";
import { NewGridControlData, IGridControlData, IGridControlSettings } from "./GridControlData.js";

export interface IPainterManagerData {
    isVisible: boolean;
    isVisiblePopup: boolean;
    TileWidth: number;
    TileHeight: number;
    SpriteWidth: number,
    SpriteHeight: number,
    SelectedColorIndex: number;
    SelectedLayer: IUILayer | null;
    Layers: IUILayer[];
    Painter: ICanvasPainterData;
    Tiler: ICanvasPainterData;
    TileMapper: ICanvasPainterData;
    valueChanged: () => void;
    AddLayer: () => void;
    RemoveLayer: (l: IUILayer) => void;
    SelectLayer: (l: IUILayer) => void;
    ChangeLayerVisibility: (l: IUILayer) => void;
    FileTilesSelected: (l: Event) => void;
    FileTileMapSelected: (l: Event) => void;
    PaletteFileSelected: (l: Event) => void;
    SelectTool: (toolName:string) => void;
    ImportOffset: number,
    palette: IPaletteData;
}
export function NewPainterManagerData(): IPainterManagerData {
    return {
        isVisible: false,
        isVisiblePopup: false,
        TileWidth: 8,
        TileHeight: 8,
        SpriteWidth: 16,
        SpriteHeight: 16,
        SelectedColorIndex: 1,
        Layers: [],
        AddLayer: () => { },
        RemoveLayer: () => { },
        SelectLayer: () => { },
        ChangeLayerVisibility: () => { },
        FileTilesSelected: () => { },
        FileTileMapSelected: () => { },
        PaletteFileSelected: () => { },
        SelectTool: () => { },
        ImportOffset: 0,
        valueChanged: () => { },
        SelectedLayer: null,
        Painter: NewCanvasPainterData(),
        Tiler: NewCanvasPainterData(),
        TileMapper: NewCanvasPainterData(),
        palette: NewPalette(),
    };
}

export interface ILayerInternal {
    UILayer: IUILayer,
    PixelData: number[]
}

export interface IUILayer {
    Name: string;
    IsSelected: boolean;
    IsVisible: boolean;
}

export interface ICanvasPainterSetupData {
    Canvas: ICanvasPainterData;
    Grid: IGridControlSettings;
    elementId: string | null;
    previewElementId: string | null;
}

export interface ICanvasPainterData {
    isPainting: boolean;
    Grid: IGridControlData;
}

export function NewCanvasPainterData(): ICanvasPainterData {
    return {
        isPainting: false,
        Grid: NewGridControlData(),
    };
}



