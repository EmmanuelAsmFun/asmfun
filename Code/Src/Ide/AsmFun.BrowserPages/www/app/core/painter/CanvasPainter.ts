import { ICanvasPainterData, NewCanvasPainterData, ICanvasPainterSetupData } from "../../data/PainterManagerData.js";
import { PainterPalette } from "./PainterPalette.js";
import { IPaletteColor } from "../../data/PaletteData.js";
import { GridControl } from "./GridControl.js";
import { IGridControlSettings, IGridControlData } from "../../data/GridControlData.js";

export class CanvasPainter {
    
    private data: ICanvasPainterData = NewCanvasPainterData();
    private setupData: ICanvasPainterSetupData; 
    private gridControl: GridControl; 
    private gridControlData: IGridControlData; 

    private imagedata: ImageData | null = null;
    private paintCanvas: HTMLCanvasElement | null = null;
    private paintCanvasPeview: HTMLCanvasElement | null = null;
    private paintContext: CanvasRenderingContext2D | null = null;
    private paintContextPreview: CanvasRenderingContext2D | null = null;

    public constructor(setup: ICanvasPainterSetupData) {
        this.data = setup.Canvas;
        this.gridControlData = setup.Canvas.Grid;
        this.setupData = setup;
        this.gridControl = new GridControl(setup.Grid, setup.Canvas.Grid);
    }

    public Show() {
        this.gridControl.Start();
        this.PrepareCanvas();
    }

    public Stop() {
        this.gridControl.Stop();
    }

    private PrepareCanvas() {
        if (this.setupData.elementId != null)
            this.paintCanvas = <HTMLCanvasElement | null>document.getElementById(this.setupData.elementId);
        if (this.setupData.previewElementId != null)
            this.paintCanvasPeview = <HTMLCanvasElement | null>document.getElementById(this.setupData.previewElementId);
        if (this.paintCanvas != null) {
            this.paintContext = this.paintCanvas.getContext("2d");
        }
        if (this.paintCanvasPeview != null) {
            this.paintContextPreview = this.paintCanvasPeview.getContext("2d");
        }
    }
   

    public SelectLayer( pixelData: number[]) {
    }


    public ClearAll() {
        if (this.paintCanvas != null && this.paintContext != null) {
            this.paintContext.clearRect(0, 0, this.paintCanvas.width, this.paintCanvas.height);
        }
        if (this.paintCanvasPeview != null && this.paintContextPreview != null) {
            this.paintContextPreview.clearRect(0, 0, this.paintCanvasPeview.width, this.paintCanvasPeview.height);
        }
    }

    public PaintPixel(x: number, y: number, color: string, useFactor: boolean = true) {
        var hFactor = useFactor ? this.gridControlData.CellWidth * this.gridControlData.ZoomLevel : this.gridControlData.ZoomLevel;
        var vFactor = useFactor ? this.gridControlData.CellHeight * this.gridControlData.ZoomLevel : this.gridControlData.ZoomLevel;
        if (this.paintCanvas != null && this.paintContext != null) {
            this.paintContext.fillStyle = color;
            this.paintContext.fillRect(x * hFactor, y * vFactor, hFactor, vFactor);
        }
        if (this.paintCanvasPeview != null && this.paintContextPreview != null) {
            this.paintContextPreview.fillStyle = color;
            this.paintContextPreview.fillRect(x, y, 1, 1);
            this.paintContextPreview.fillRect(this.data.Grid.Width + 2 + x * 2, y * 2, 2, 2);
        }
    }

    public ClearPixel(x: number, y: number) {
        var hFactor = this.gridControlData.CellWidth * this.gridControlData.ZoomLevel;
        var vFactor = this.gridControlData.CellHeight * this.gridControlData.ZoomLevel;
        if (this.paintCanvas != null && this.paintContext != null) 
            this.paintContext.clearRect(x * hFactor, y * vFactor, hFactor, vFactor);
        if (this.paintCanvasPeview != null && this.paintContextPreview != null) {
            this.paintContextPreview.clearRect(x, y, 1, 1);
            this.paintContextPreview.clearRect(this.data.Grid.Width + 2 + x * 2, y * 2, 2, 2);
        }
    }
    
    public StartRawPaint() {
        if (this.paintContext == null || this.paintCanvas == null) return;
        this.imagedata = this.paintContext.createImageData(this.paintCanvas.width, this.paintCanvas.height);
    }

    public PaintTile(xOffset: number, yOffset: number,readOffset:number, data: number[], palette: PainterPalette) {
        if (this.paintContext == null || this.paintCanvas == null) return;
        var x = 0;
        var y = 0;
        for (var i = 0; i < 256; i++) {
            var colorIndex = data[i + readOffset];
            
            var color = palette.GetColor(colorIndex);
            if (color == null) continue;
            var colorHex = color.colorHex;
            if (colorIndex == 0)
                colorHex = "#00000000";
            this.PaintPixel(x + xOffset, y + yOffset, colorHex,false);
            if (x == 16) {
                y++;
                x = 0;
            }
            x++;
        }
    }

    public PaintRawPixel(pos: number, color: IPaletteColor) {
        if (this.imagedata == null ) return;
        var pixelindex = pos * 4;
        this.imagedata.data[pixelindex] = color.r;     // Red
        this.imagedata.data[pixelindex + 1] = color.g; // Green
        this.imagedata.data[pixelindex + 2] = color.b;  // Blue
        this.imagedata.data[pixelindex + 3] = 255;   // Alpha 
    }

    public EndRawPaint() {
        if (this.paintContext == null || this.paintCanvas == null || this.imagedata == null) return;
        this.paintContext.putImageData(this.imagedata, this.paintCanvas.width, this.paintCanvas.height);
    }
 

    
    public SetPaintState(paintState: boolean) {
        
    }

   
}