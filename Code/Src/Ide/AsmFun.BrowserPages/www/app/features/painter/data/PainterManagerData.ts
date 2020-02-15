// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { NewPalette, IPaletteData } from "../../palette/data/PaletteData.js";
import { ILayerManagerData, NewLayerManagerData } from "./LayerDatas.js";
import { NewGridControlData, IGridControlData, IGridControlSettings, IGridSelectionData, NewGridSelectionData } from "./GridControlData.js";
import { IPopupWindowData } from "../../../framework/data/IPopupData.js";

export interface IPainterManagerData extends IPopupWindowData{
    isVisible: boolean;
    isVisiblePopup: boolean;
    SelectedTool: string;
    TileWidth: number;
    TileHeight: number;
    SpriteWidth: number,
    SpriteHeight: number,
    SelectedColorIndex: number;
    
    Painter: ICanvasPainterData;
    Tiler: ICanvasPainterData;
    TileMapper: ICanvasPainterData;
    
    
    FileTilesSelected: (l: Event) => void;
    FileTileMapSelected: (l: Event) => void;
    PaletteFileSelected: (l: Event) => void;
    ImportOffset: number,
    palette: IPaletteData;
    layerManager: ILayerManagerData;
}
export function NewPainterManagerData(): IPainterManagerData {
    return {
        isVisible: false,
        isVisiblePopup: false,
        SelectedTool:"Paint",
        TileWidth: 8,
        TileHeight: 8,
        SpriteWidth: 16,
        SpriteHeight: 16,
        SelectedColorIndex: 1,
        FileTilesSelected: () => { },
        FileTileMapSelected: () => { },
        PaletteFileSelected: () => { },
        ImportOffset: 0,
        
        Painter: NewCanvasPainterData(),
        Tiler: NewCanvasPainterData(),
        TileMapper: NewCanvasPainterData(),
        palette: NewPalette(),
        layerManager: NewLayerManagerData(),
    };
}



export interface ICanvasPainterSetupData {
    Canvas: ICanvasPainterData;
    Grid: IGridControlSettings;
    elementId: string | null;
    previewElementId: string | null;
    ControlGroupName:string,
}

export interface ICanvasPainterData {
    isPainting: boolean;
    Grid: IGridControlData;
    Selection: IGridSelectionData;
}

export function NewCanvasPainterData(): ICanvasPainterData {
    return {
        isPainting: false,
        Grid: NewGridControlData(),
        Selection: NewGridSelectionData(),
    };
}



