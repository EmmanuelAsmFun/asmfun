// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { CanvasPainter } from "./CanvasPainter.js"
import { IPainterManagerData, NewPainterManagerData, NewCanvasPainterData, ICanvasPainterSetupData } from "./data/PainterManagerData.js";
import { ConfirmIcon } from "../../common/Enums.js";
import { ColorPalette } from "../palette/ColorPalette.js";
import { IGridCellChanged, GridSelectionType } from "./data/GridControlData.js";
import { IControlManager } from "../../framework/IControlManager.js";
import { LayerSelectionChanged, LayerVisibilityChanged } from "./commands/LayerCommands.js";
import { LayerContainer } from "./LayerContainer.js";
import { PainterOpenManagerCommand, PainterSelectToolCommand } from "./commands/PainterCommands.js";
import { ILayerInternal } from "./data/LayerDatas.js";
import { UIDataNamePainter } from "./PainterFactory.js";
import { IMainData } from "../../framework/data/MainData.js";
import { IAsmFunAppData } from "../player/data/AsmFunAppData.js";
import { KeyboardKeyCommand, EditorEnableCommand } from "../editor/commands/EditorCommands.js";
import { ServiceName } from "../../framework/serviceLoc/ServiceName.js";
import { IPopupWindow, IPopupSubscription, IPopupWindowData, IPopupEventData } from "../../framework/data/IPopupData.js";

enum PaintTools {
    Unknown,
    Paint,
    Erase,
    Fill,
    Select,
    SelectRect,
    SelectCircle,
    SelectLine,
    SelectMagic,
}

export class PainterManager implements IPopupWindow{
  
   
    private selectedTile = 0;
    private selectedTool: PaintTools = PaintTools.Paint;
    private painterPalette: ColorPalette = new ColorPalette();
    private mainData: IMainData;
    private myAppData: IAsmFunAppData;
    private data: IPainterManagerData;
    private painter: CanvasPainter;
    private tiler: CanvasPainter;
    private tileMapper: CanvasPainter;
    private layerContainer: LayerContainer;
    private tilesData: number[] = [];
    private tileMapData: number[] = [];
    
    private imgDataBase64 = "AAABAQEBAQEBAQEBAQEAAAABBgYGEhISEhISEhIIAQABBgYHAQEBAQEBAQcSEggBAQYHAQYGBgYGBgYBBxIIAQEGAQYGBgYGBgYGBgESCAEBEgEGBgYBAQEGBgYBEggBAQYHAQEBAQEBBgYGARIIAQESBwcHAQYGBgYGAQcSCAEBEgcHBwEGBgYBAQcHEggBARIHBwcHAQEBBwcHBxIIAQESBwcHAQYGBgEHBwcSCAEBEgcHBwEGBgYBBwcHEggBARISBwcHAQEBBwcHEhIIAQEIEhISEhISEhISEhIICAEAAQgICAgICAgICAgICAEAAAABAQEBAQEBAQEBAQEAAA==";
    private paletteBase64 = "YAIAAIAPIAuwAPAA/w7SD1EIcA//D/APwA/AAHQAYQeVDMUOow0ABUcP1w8mC3YP3A84AokE3AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    public isVisible: boolean = false;

    private popupMe: IPopupSubscription;
    public CanOpenPopup(evt: IPopupEventData) { evt.SetCanOpen(true); }
    public OpeningPopup() { this.InitImage(); }
    public ClosingPopup() { }
    public GetData(): IPopupWindowData {
        return this.data;
    }

    constructor(mainData: IMainData) {
        var thiss = this;
        this.mainData = mainData;
        this.myAppData = mainData.appData;
        var controlManager: IControlManager = mainData.controlManager;
        this.popupMe = mainData.popupManager.Subscribe(0, this);
        this.data = mainData.GetUIData(UIDataNamePainter);
        this.layerContainer = new LayerContainer(mainData, this.data.layerManager);


        this.data.Tiler.Grid.CellWidth = 16;
        this.data.Tiler.Grid.CellHeight = 16;
        this.data.Tiler.Grid.Width = 256;
        this.data.Tiler.Grid.Height = 128;
        this.data.Tiler.Grid.ZoomLevel = 2;

        this.data.TileMapper.Grid.CellWidth = 16;
        this.data.TileMapper.Grid.CellHeight = 16;
        this.data.TileMapper.Grid.Width = 256;
        this.data.TileMapper.Grid.Height = 128;
        this.data.TileMapper.Grid.ZoomLevel = 1;

        var setupPainter: ICanvasPainterSetupData = {
            elementId : "paintCanvas",
            previewElementId : "paintCanvasPeview",
            Canvas: this.data.Painter,
            Grid: {
                CellChanged: (c) => this.RequestPaintPixel(c),
                ZoomChanged: (z) => { this.RedrawTile(); },
                CellHiliteElementId: "paintCellHilite",
                ElementId: "paintGridControl",
                EnableKeys: true,
                EnableMouse: true,
            },
            ControlGroupName : "Painter",
        }
        this.painter = new CanvasPainter(setupPainter, controlManager);


        var setupTiles: ICanvasPainterSetupData = {
            elementId: "tilerCanvas",
            previewElementId: null,
            Canvas: this.data.Tiler,
            Grid: {
                CellChanged: (c) => { },
                ZoomChanged: () => { this.RedrawTiles();},
                CellHiliteElementId: "tilerCellHilite",
                ElementId: "tilerGridControl",
                EnableKeys: false,
                EnableMouse: true,
            },
            ControlGroupName: "Painter",
        }
        this.tiler = new CanvasPainter(setupTiles, controlManager);
        var setupTileMap: ICanvasPainterSetupData = {
            elementId: "tileMapperCanvas",
            previewElementId: null,
            Canvas: this.data.TileMapper,
            Grid: {
                CellChanged: (c) => { },
                ZoomChanged: () => { this.RedrawTileMap(); },
                CellHiliteElementId: "tileMapperCellHilite",
                ElementId: "tileMapperGridControl",
                EnableKeys: false,
                EnableMouse: true,
            },
            ControlGroupName: "Painter",
        }
        this.tileMapper = new CanvasPainter(setupTileMap, controlManager);

        //this.service = this.mainData.container.Resolve<ProjectService>(ProjectService.ServiceName) ?? new ProjectService(mainData);

        this.mainData.commandManager.Subscribe2(new PainterOpenManagerCommand(null), this, x => this.popupMe.SwitchState(x.state));
        this.mainData.commandManager.Subscribe2(new PainterSelectToolCommand(null), this, x => this.SelectTool(x.toolName));
        this.mainData.commandManager.Subscribe2(new KeyboardKeyCommand(), this, x => this.KeyboardKey(x));

        this.mainData.eventManager.Subscribe2(new LayerSelectionChanged(null), this, x => this.SelectedLayerChanged(x.Layer));
        this.mainData.eventManager.Subscribe2(new LayerVisibilityChanged(null), this, x => this.LayerVisibilityChanged(x.layer));


        this.data.Painter.Grid.CellWidth = this.data.TileWidth;
        this.data.Painter.Grid.CellHeight = this.data.TileHeight;
        this.data.Painter.Grid.Width= this.data.SpriteWidth;
        this.data.Painter.Grid.Height = this.data.SpriteHeight;

       
        this.data.FileTilesSelected = (l) => this.FileSelected(l, d => this.LoadTiles(d));
        this.data.FileTileMapSelected = (l) => this.FileSelected(l, d => this.LoadTileMap(d));
        this.data.PaletteFileSelected = (l) => this.FileSelected(l, d => this.LoadPalette(d));
        // Init palette
        this.painterPalette.Init(this.data.palette);
        this.painterPalette.SetDefaultPalette();
        this.painterPalette.SelectColor(1);
        this.SetSize();

        //setTimeout(() => this.OpenManager(true), 100);
        this.layerContainer.AddLayer();
    }
 

    private InitImage() {
        this.layerContainer.SelectFirstLayer();
        this.tilesData = Array.from(Uint8Array.from(atob(this.imgDataBase64), c => c.charCodeAt(0)));
        var paletteData = Uint8Array.from(atob(this.paletteBase64), c => c.charCodeAt(0));
        this.painterPalette.Parse2ByteColors(paletteData);
        this.painter.Show();
        this.tiler.Show();
        this.tileMapper.Show();
        this.RedrawTiles();
        setTimeout(() => this.RequestSelectTile(1,0,true), 100);
    }


    private SelectTool(name: string | null): boolean {
        if (name == null) return false;
        switch (name) {
            case "Select": this.selectedTool = PaintTools.Select; this.data.Painter.Selection.SetSelectType(GridSelectionType.Free); break;
            case "SelectRect": this.selectedTool = PaintTools.SelectRect; this.data.Painter.Selection.SetSelectType(GridSelectionType.Rect); break;
            case "SelectCircle": this.selectedTool = PaintTools.SelectCircle; this.data.Painter.Selection.SetSelectType(GridSelectionType.Circle); break;
            case "SelectLine": this.selectedTool = PaintTools.SelectLine; this.data.Painter.Selection.SetSelectType(GridSelectionType.Line); break;
            case "SelectMagic": this.selectedTool = PaintTools.SelectMagic; this.data.Painter.Selection.SetSelectType(GridSelectionType.Magic); break;
            case "Paint": this.selectedTool = PaintTools.Paint; break;
            case "Erase": this.selectedTool = PaintTools.Erase; break;
            case "Fill": this.selectedTool = PaintTools.Fill; break;
        }
        this.data.SelectedTool = name;
        this.data.Painter.Selection.IsSelectionEnable =
            this.selectedTool == PaintTools.Select || this.selectedTool == PaintTools.SelectRect || this.selectedTool == PaintTools.SelectCircle
            || this.selectedTool == PaintTools.SelectLine || this.selectedTool == PaintTools.SelectMagic;
        return true;
    }


    public SetSize() {
        this.layerContainer.SetSize(this.data.SpriteWidth , this.data.SpriteHeight);

    }
    private SelectedLayerChanged(layer: ILayerInternal | null) {
        if (layer == null) return;
        this.painter.SelectLayer(layer.PixelData);
    }
    private LayerVisibilityChanged(layer: ILayerInternal | null) {
        this.RedrawTile();
    }

    private RequestSelectTile(x: number, y: number, paintState: boolean | null) {
        var layerPxData = this.tilesData.slice(x * 16 + y * 16 * 16, 16 * 16);
        if (!this.layerContainer.SetLayerPixelData(layerPxData)) return;
        this.RedrawTile();
        this.selectedTile = x * 16 + y * 16 * 16;
    }
    private RequestPaintPixel(cellChanges: IGridCellChanged) {
        if (!cellChanges.IsMouseDown) return;
        if (this.selectedTool != PaintTools.Paint && this.selectedTool != PaintTools.Erase && this.selectedTool != PaintTools.Fill) return;
        const x = cellChanges.CellX;
        const y = cellChanges.CellY;
        

        var paintState = this.selectedTool == PaintTools.Paint && !cellChanges.AltKey || this.selectedTool == PaintTools.Fill;
        var layer = this.layerContainer.GetSelectedLayer();
        if (layer == null) return;
       
        if (this.selectedTool == PaintTools.Fill) {
            this.Fill(x, y, paintState, layer);
        }
        else {
            this.PaintPixel(x, y, paintState, layer);
        }
    }

    private Fill(startX: number, startY: number, paintState: boolean, layer: ILayerInternal) {
        var selection = this.painter.GetSelection();
        var hasPainted = false;
        const w = this.data.Painter.Grid.Width;
        const h = this.data.Painter.Grid.Height;
        if (selection != null && selection.length > 0) {
            // Try fill selection.
            for (let x = 0; x < w; x++) {
                if (selection[x] == undefined) continue;
                for (var y = 0; y < h; y++) {
                    if (selection[x][y]) {
                        this.PaintPixel(x, y, paintState, layer)
                        hasPainted = true;
                    }
                }
            }
        }
        if (!hasPainted) {
            // fill the complete layer.
            for (let x = 0; x < w; x++) {
                for (var y = 0; y < h; y++) {
                    this.PaintPixel(x, y, paintState, layer)
                }
            }
        }
    }

    private PaintPixel(x: number, y: number, paintState: boolean, layer: ILayerInternal) {
        // Check if there is a selection and we are inside the selection
        var selection = this.painter.GetSelection();
        if (selection != null && selection.length > 0) {
            if (selection[x] != null && selection[x][y] != null) {
                if (!selection[x][y])
                    return;
            }
            else
                return;
        }

        // Check if we need to paint the pixel depending of higher layers
        
        var pos = x + y * this.data.SpriteWidth;
        var needPaint = this.layerContainer.HasOverlayingPixel(layer.Index,pos);
        if (!paintState) {
            layer.PixelData[pos] = 0;
            if (needPaint)
                this.painter.ClearPixel(x, y);
        }
        else {
            var colIndex: number = this.painterPalette.GetSelectedColorIndex();
            layer.PixelData[pos] = colIndex;
            this.tilesData[this.selectedTile + pos] = colIndex;
            this.tiler.PaintTile(x, y, pos, this.tilesData, this.painterPalette);
            if (needPaint) {
                var col = this.painterPalette.GetColor(colIndex);
                if (col != null)
                    this.painter.PaintPixel(x, y, col.colorHex);
            }
        }
    }
  

    private RedrawTile() {
        var w = this.data.SpriteWidth;
        var h = this.data.SpriteHeight;

        // Make a result array by concat all layers.
        var resultArray: number[] = this.layerContainer.GetMergedPixels();
        
        // Repaint on canvas
        this.painter.ClearAll();
        for (var y:number = 0; y < w; y++) {
            for (var x:number = 0; x < h; x++) {
                var pos:number = x + y * w;
                if (resultArray[pos] > 0) {
                    var col = this.painterPalette.GetColor(resultArray[pos]);
                    if (col != null)
                        this.painter.PaintPixel(x, y, col.colorHex);
                }
            }
        }
    }


    private FileSelected(event: Event, onLoaded: (data: Uint8Array)=> void) {
        var thiss = this;
        if (event.target == null) return;
        var files = (event.target as HTMLInputElement).files;
        if (files == null || files.length === 0) return;
        var file = files[0];
        var reader = new FileReader();
        reader.onload = function (ev) {
            if (ev.target == null || ev.target.result == null) return;
            var arBuffer = new Uint8Array(<any>ev.target.result);
            var arBuffersl = arBuffer.slice(Number(thiss.data.ImportOffset));
            onLoaded(arBuffersl);
        };
        reader.readAsArrayBuffer(file);
    }

    private LoadTiles(data: Uint8Array) {
        var bpp = 8;
        this.tilesData = this.ParseByBpp(data, bpp);
        this.RedrawTiles();
    }
    private LoadTileMap(data: Uint8Array) {
        var bpp = 8;
        this.tileMapData = this.ParseByBpp(data, bpp);
        this.RedrawTileMap();
    }
    private LoadPalette(data: Uint8Array) {
        this.painterPalette.Parse2ByteColors(data);
        this.RedrawTile();
    }


    private RedrawTiles() {
        this.tiler.ClearAll();
        var w = 16; //this.data.TilesData.SpriteWidth * this.data.TilesData.SpriteHeight;
        var h = 16;
        var size = w * h; 
        var numberOfTiles = Math.floor(this.tilesData.length / size);
        var x = 0;
        var y = 0;
        for (var i = 0; i < numberOfTiles; i++) {
            this.tiler.PaintTile(x, y, i * size, this.tilesData,this.painterPalette);
            x += w;
            if ((i+1) % 6 == 0) {
                x = 0;
                y += h;
            }
        }
    }
    private RedrawTileMap() {
       
        this.tileMapper.ClearAll();
        var w = 16; //this.data.TilesData.SpriteWidth * this.data.TilesData.SpriteHeight;
        var h = 16;
        var size = w * h; 
        var x = 0;
        var y = 0;
        for (var i = 0; i < this.tileMapData.length; i += 2) {
            var byte0 = this.tileMapData[i];
            var byte1 = this.tileMapData[i + 1];
            var tileIndex = (byte0 | ((byte1 & 3) << 8));

            // Tile Flipping
            var verticalFlip = ((byte1 >> 3) & 1) != 0;
            var horizontalFlip = ((byte1 >> 2) & 1) != 0;
            var paletteOffset = ((byte1 >> 4) << 4);

            this.tileMapper.PaintTile(x, y, tileIndex * size, this.tilesData, this.painterPalette);
            x += w;
            if ((i + 2) % 64 == 0) {
                x = 0;
                y += h;
            }
        }
    }


    private ParseByBpp(data: Uint8Array, bpp: number): number[] {
        switch (bpp) {
            case 4:
                var newData: number[] = []
                var sourceData = Array.from(data);
                for (var i = 0; i < sourceData.length; i++) {
                    newData.push(sourceData[i] >> 4);
                    newData.push(sourceData[i] & 0xf);
                }
                
                return newData;
            case 8:
               return Array.from(data);
        }
        return [];
    }


    private KeyboardKey(x: KeyboardKeyCommand): void {
        if (!this.data.isVisible || !this.data.Painter.Grid.IsActive) return;
        switch (x.key.toLowerCase()) {
            case "m": x.allowContinueEmit = !this.SelectTool("Select"); return;
            case "b": x.allowContinueEmit = !this.SelectTool("Paint"); return;
            case "e": x.allowContinueEmit = !this.SelectTool("Erase"); return;
        }
    }



    

    public static NewData(): IPainterManagerData {
        return NewPainterManagerData();
    }

    public static ServiceName: ServiceName = { Name: "PainterManager" };
}

