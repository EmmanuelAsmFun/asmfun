// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IAsmFunAppData } from "../../data/AsmFunAppData.js"
import { CanvasPainter } from "./CanvasPainter.js"
import { GridControl } from "./GridControl.js"
import { IMainData } from "../../data/MainData.js";
import { EditorEnableCommand, KeyboardKeyCommand } from "../../data/commands/EditorCommands.js";
import { ServiceName } from "../../serviceLoc/ServiceName.js";
import { IPainterManagerData, NewPainterManagerData, IUILayer, NewCanvasPainterData, ILayerInternal, ICanvasPainterSetupData } from "../../data/PainterManagerData.js";
import { PainterOpenManagerCommand } from "../../data/commands/PainterCommands.js";
import { ConfirmIcon } from "../../common/Enums.js";
import { PainterPalette } from "./PainterPalette.js";
import { IGridCellChanged } from "../../data/GridControlData.js";

enum PaintTools {
    Unknown,
    Paint,
    Erase,
    Select
}

export class PainterManager {
   
    private selectedTile = 0;
    private selectedTool: PaintTools = PaintTools.Paint;
    private painterPalette: PainterPalette = new PainterPalette();
    private mainData: IMainData;
    private myAppData: IAsmFunAppData;
    private data: IPainterManagerData;
    private painter: CanvasPainter;
    private tiler: CanvasPainter;
    private tileMapper: CanvasPainter;
    private tilesData: number[] = [];
    private tileMapData: number[] = [];
    private layers: ILayerInternal[] = [];
    private selectedLayer: ILayerInternal | null = null;
    private imgDataBase64 = "AAABAQEBAQEBAQEBAQEAAAABBgYGEhISEhISEhIIAQABBgYHAQEBAQEBAQcSEggBAQYHAQYGBgYGBgYBBxIIAQEGAQYGBgYGBgYGBgESCAEBEgEGBgYBAQEGBgYBEggBAQYHAQEBAQEBBgYGARIIAQESBwcHAQYGBgYGAQcSCAEBEgcHBwEGBgYBAQcHEggBARIHBwcHAQEBBwcHBxIIAQESBwcHAQYGBgEHBwcSCAEBEgcHBwEGBgYBBwcHEggBARISBwcHAQEBBwcHEhIIAQEIEhISEhISEhISEhIICAEAAQgICAgICAgICAgICAEAAAABAQEBAQEBAQEBAQEAAA==";
    private paletteBase64 = "YAIAAIAPIAuwAPAA/w7SD1EIcA//D/APwA/AAHQAYQeVDMUOow0ABUcP1w8mC3YP3A84AokE3AgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";
    public isVisible: boolean = false;


    constructor(mainData: IMainData) {
        var thiss = this;
        this.mainData = mainData;
        this.myAppData = mainData.appData;
        this.data = mainData.appData.painterManager;
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
             }
        }
        this.painter = new CanvasPainter(setupPainter);


        var setupTiles: ICanvasPainterSetupData = {
            elementId: "tilerCanvas",
            previewElementId: null,
            Canvas: this.data.Tiler,
            Grid: {
                CellChanged: (c) => this.RequestPaintPixel(c),
                ZoomChanged: () => { this.RedrawTiles();},
                CellHiliteElementId: "tilerCellHilite",
                ElementId: "tilerGridControl",
                EnableKeys: false,
                EnableMouse: true,
            }
        }
        this.tiler = new CanvasPainter(setupTiles);
        var setupTileMap: ICanvasPainterSetupData = {
            elementId: "tileMapperCanvas",
            previewElementId: null,
            Canvas: this.data.TileMapper,
            Grid: {
                CellChanged: (c) => this.RequestPaintPixel(c),
                ZoomChanged: () => { this.RedrawTileMap(); },
                CellHiliteElementId: "tileMapperCellHilite",
                ElementId: "tileMapperGridControl",
                EnableKeys: false,
                EnableMouse: true,
            }
        }
        this.tileMapper = new CanvasPainter(setupTileMap);

        //this.service = this.mainData.container.Resolve<ProjectService>(ProjectService.ServiceName) ?? new ProjectService(mainData);

        this.mainData.commandManager.Subscribe2(new PainterOpenManagerCommand(null), this, x => this.OpenManager(x.state));


        this.data.Painter.Grid.CellWidth = this.data.TileWidth;
        this.data.Painter.Grid.CellHeight = this.data.TileHeight;
        this.data.Painter.Grid.Width= this.data.SpriteWidth;
        this.data.Painter.Grid.Height = this.data.SpriteHeight;

        this.data.AddLayer = () => this.AddLayer();
        this.data.RemoveLayer = (l) => this.RemoveLayer(l);
        this.data.SelectLayer = (l) => this.SelectLayer(l);
        this.data.ChangeLayerVisibility = (l) => this.ChangeLayerVisibility(l);
        this.data.FileTilesSelected = (l) => this.FileSelected(l, d => this.LoadTiles(d));
        this.data.FileTileMapSelected = (l) => this.FileSelected(l, d => this.LoadTileMap(d));
        this.data.PaletteFileSelected = (l) => this.FileSelected(l, d => this.LoadPalette(d));
        this.data.SelectTool = (name) => this.SelectTool(name);
        // Init palette
        this.painterPalette.Init(this.data.palette);
        this.painterPalette.SetDefaultPalette();
        this.painterPalette.SelectColor(1);

        //setTimeout(() => this.OpenManager(true), 100);
        this.AddLayer();
       
    }


    private InitImage() {
        this.SelectLayer(this.data.Layers[0]);
        this.tilesData = Array.from(Uint8Array.from(atob(this.imgDataBase64), c => c.charCodeAt(0)));
        var paletteData = Uint8Array.from(atob(this.paletteBase64), c => c.charCodeAt(0));
        this.painterPalette.Parse2ByteColors(paletteData);
        this.painter.Show();
        this.tiler.Show();
        this.tileMapper.Show();
        this.RedrawTiles();
        setTimeout(() => this.RequestSelectTile(1,0,true), 100);
    }


    private SelectTool(name: string) {
        switch (name) {
            case "Select": this.selectedTool = PaintTools.Select; break;
            case "Paint": this.selectedTool = PaintTools.Paint; break;
            case "Erase": this.selectedTool = PaintTools.Erase; break;
        }
        this.data.Painter.Grid.IsSelectionEnable = this.selectedTool == PaintTools.Select;
    }

   
    private RequestSelectTile(x: number, y: number, paintState: boolean | null) {
        if (this.selectedLayer == null) return;
        this.selectedLayer.PixelData = this.tilesData.slice(x * 16 + y * 16 * 16, 16 * 16);
        this.RedrawTile();
        this.selectedTile = x * 16 + y * 16 * 16;
    }
    private RequestPaintPixel(cellChanges: IGridCellChanged) {
        if (this.selectedLayer == null) return;
        if (!cellChanges.IsMouseDown) return;
        if (this.selectedTool != PaintTools.Paint && this.selectedTool != PaintTools.Erase) return;
        const x = cellChanges.CellX;
        const y = cellChanges.CellY;
        var pos = x + y * this.data.SpriteWidth;

        var paintState = this.selectedTool == PaintTools.Paint && !cellChanges.AltKey;
        

        // Check if we need to paint the pixel depending of higher layers
        var needPaint = true;
        var selectedLayerIndex = this.layers.indexOf(this.selectedLayer);
        for (var i = 0; i < selectedLayerIndex; i++) {
            if (this.layers[i].UILayer.IsVisible && this.layers[i].PixelData[pos] > 0) {
                needPaint = false;
                break;
            }
        }
        if (!paintState) {
            this.selectedLayer.PixelData[pos] = 0;
            if (needPaint)
                this.painter.ClearPixel(x, y);
        }
        else {
            var colIndex: number = this.painterPalette.GetSelectedColorIndex();
            this.selectedLayer.PixelData[pos] = colIndex;
            this.tilesData[this.selectedTile + pos] = colIndex;
            this.tiler.PaintTile(x, y, pos, this.tilesData, this.painterPalette);
            if (needPaint) {
                var col = this.painterPalette.GetColor(colIndex);
                if (col != null)
                    this.painter.PaintPixel(x, y, col.colorHex);
            }
        }
    }
  

    //#region layers
    private AddLayer() {
        var layer: ILayerInternal = {
            PixelData: Array.from({ length: this.data.SpriteWidth * this.data.SpriteHeight }),
            UILayer: {
                Name: "Background",
                IsVisible: true,
                IsSelected: false,
            }
        };
        layer.PixelData.fill(0);
        this.data.Layers.splice(0, 0, layer.UILayer);
        this.layers.splice(0, 0, layer);
    }

    private RemoveLayer(layer: IUILayer | null) {
        if (this.data.Layers.length <= 1) return;
        if (layer == null) 
            layer = this.data.SelectedLayer;
        if (layer == null) return;
        const index = this.data.Layers.indexOf(layer);
        if (index < 0) 
            return;
        this.myAppData.alertMessages.Confirm("Are you sure?", "Are you sure you ant to delete '" + layer.Name + "' ?", ConfirmIcon.Question, (r) => {
            if (layer == null) return;
            if (r) {
                this.data.Layers.splice(index, 1);
                this.layers.splice(index, 1);
                if (layer.IsSelected)
                    this.SelectLayer(this.data.Layers[0]);
            }
        });
    }

    private SelectLayer(layer: IUILayer) {
        // deselect previous
        var selected = this.data.Layers.find(x => x.IsSelected);
        var internalLayer = this.layers.find(x => x.UILayer == layer);
        if (internalLayer == null) return;
        if (selected != null)
            selected.IsSelected = false;
        layer.IsSelected = true;
        this.data.SelectedLayer = layer;
        this.selectedLayer = internalLayer;
        this.painter.SelectLayer(this.selectedLayer.PixelData);
        
    }

    private ChangeLayerVisibility(layer: IUILayer) {
        if (layer == null) return;
        var internalLayer = this.layers.find(x => x.UILayer == layer);
        if (internalLayer == null) return;
        layer.IsVisible = !layer.IsVisible;
        this.RedrawTile();
    }
    //#endregion layers



    private RedrawTile() {
        var w = this.data.SpriteWidth;
        var h = this.data.SpriteHeight;

        // Make a result array by concat all layers.
        var resultArray: number[] = Array.from({ length: w * h });
        resultArray.fill(0);
        for (var y: number = 0; y < w; y++) {
            for (var x: number = 0; x < h; x++) {
                var pos: number = x + y * w;
                for (var i = this.layers.length - 1; i >= 0; i--) {
                    var layer = this.layers[i];
                    if (layer.UILayer.IsVisible && layer.PixelData[pos] > 0) {
                        resultArray[pos] = layer.PixelData[pos];
                    }
                }
            }
        }
        
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
        if (this.selectedLayer == null) return;
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

    public OpenManager(state: boolean | null) {
        if (state == null)
            state = !this.data.isVisible;
        if (state === this.data.isVisible) return;
        if (!state)
            this.Close();
        else
            this.Open();
    }

    public Open() {
        var thiss = this;
        this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(false));
        this.Show();
    }
    public Close() {
        this.painter.Stop();
        this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(true));
        this.Hide();
    }
    private Show() {
        var thiss = this;
        this.data.isVisible = true;
        setTimeout(() => {
            thiss.data.isVisiblePopup = true;
            this.InitImage();
        }, 10)
    }
    private Hide() {
        var thiss = this;
        setTimeout(() => { thiss.data.isVisible = false; }, 200)
        this.data.isVisiblePopup = false;
    }


    

    public static NewData(): IPainterManagerData {
        return NewPainterManagerData();
    }

    public static ServiceName: ServiceName = { Name: "PainterManager" };
}

