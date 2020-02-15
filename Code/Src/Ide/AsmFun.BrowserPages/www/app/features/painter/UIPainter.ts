//import { IPainterManagerData, IUILayer } from "../../data/PainterManagerData";

//export class UIPainter
//{
//    private data: IPainterManagerData;
//    private paletteColors: number[] = [];
//    private paintData: number[] = [];
//    private lastX:number = 0;
//    private lastY:number = 0;

//    private paintCanvas: HTMLCanvasElement | null = null;
//    private paintCanvasPeview: HTMLCanvasElement | null = null;
//    private paintContext: CanvasRenderingContext2D | null = null;
//    private paintContextPreview: CanvasRenderingContext2D | null = null;

//    public constructor(painterManagerData: IPainterManagerData) {
//        this.data = painterManagerData;
//        this.data.MouseScroll = e => this.MouseScrolling(e);
        
//    }

//    public Show() {
//        this.PrepareCanvas();
//    }
//    public Stop() {
//        if (this.paintCanvas == null) return;
//        this.paintCanvas.removeEventListener('mousemove', (e: MouseEvent) => this.MouseMoving(e), false);
//        this.paintCanvas.removeEventListener('mousedown', (e: MouseEvent) => this.MouseDown(e), false);
//        this.paintCanvas.removeEventListener('mouseup', (e: MouseEvent) => this.MouseUp(e), false);
//    }



//    private PrepareCanvas() {

//        this.paintCanvas  = <HTMLCanvasElement | null>document.getElementById("paintCanvas");
//        this.paintCanvasPeview = <HTMLCanvasElement | null>document.getElementById("paintCanvasPeview");
//        if (this.paintCanvas == null || this.paintCanvasPeview == null) return;
//        this.paintContext = this.paintCanvas.getContext("2d");
//        this.paintContextPreview = this.paintCanvasPeview.getContext("2d");
//        if (this.paintContext == null || this.paintContextPreview == null) return;
//        this.paintData = new Array(this.data.SpriteWidth * this.data.SpriteHeight);
//        this.paintCanvas.addEventListener('mousemove', (e: MouseEvent) => this.MouseMoving(e), false);
//        this.paintCanvas.addEventListener('mousedown', (e: MouseEvent) => this.MouseDown(e), false);
//        this.paintCanvas.addEventListener('mouseup', (e: MouseEvent) => this.MouseUp(e), false);

//        //var imagedata = paintContext.createImageData(paintCanvas.width, paintCanvas.height);
//        this.paintContext.fillStyle = "#111111";
//        this.paintContext.fillRect(0, 0, this.paintCanvas.width, this.paintCanvas.height);
//    }

//    private MouseDown(e: MouseEvent) {
//        if ( this.paintCanvas==null) return;
//        this.UpdateTilePos(e);
//        this.lastY = -1;
//        this.lastX = -1;
//        this.PaintMousePixel();
//        this.data.isPainting = true;
//    }
//    private MouseUp(e) {
//        this.data.isPainting = false;
//        this.lastY = -1;
//        this.lastX = -1;
//    }

//    private MouseMoving(e: MouseEvent) {
//        if (this.paintCanvas == null) return;
//        this.UpdateTilePos(e);
//        if (!this.data.isPainting || this.paintContext == null) return;
//        // Absorb same pixel
//        if (this.lastX == this.data.MouseTileX && this.lastY == this.data.MouseTileY) return;
//        this.lastX = this.data.MouseTileX;
//        this.lastY = this.data.MouseTileY;
//        this.PaintMousePixel();
        
//        //this.paintContext.lineTo(mousePos.x, mousePos.y)
//        //this.paintContext.stroke();
//            //store(currentPosition.x, currentPosition.y, currentSize, currentColor);
//    }

//    private PaintMousePixel() {
//        if (this.paintContext == null) return;
//        if (this.data.MouseTileX < 0 || this.data.MouseTileX >= this.data.SpriteWidth ||
//            this.data.MouseTileY < 0 || this.data.MouseTileY >= this.data.SpriteHeight) return;
//        this.PaintPixel(this.data.MouseTileX, this.data.MouseTileY, "#339900");
//        this.paintData[this.data.MouseTileX + this.data.MouseTileY * this.data.SpriteWidth] = 1;
//    }

//    private PaintPixel(x: number, y: number, color: string) {
//        if (this.paintContext == null || this.paintContextPreview == null) return;
//        var hFactor = this.data.TileWidth * this.data.ZoomLevel;
//        var vFactor = this.data.TileHeight * this.data.ZoomLevel;
//        this.paintContext.fillStyle = color;// this.GetRandomColor();
//        this.paintContext.fillRect(x * hFactor, y * vFactor, hFactor, vFactor);
//        this.paintContextPreview.fillStyle = color;
//        this.paintContextPreview.fillRect(x, y, 1, 1);
//        this.paintContextPreview.fillRect(this.data.SpriteWidth + 2 + x*2, y*2, 2, 2);
//    }

//    private UpdateTilePos(e: MouseEvent) {
//        if (this.paintCanvas == null) return;
//        var mousePos = this.GetMousePosition(this.paintCanvas, e);
//        this.data.MouseTileX = Math.floor(mousePos.x / (this.data.TileWidth * this.data.ZoomLevel));
//        this.data.MouseTileY = Math.floor(mousePos.y / (this.data.TileHeight * this.data.ZoomLevel));
//    }

//    private GetMousePosition(canvas: HTMLCanvasElement, e: MouseEvent) {
//        var rect = canvas.getBoundingClientRect();
//        return {
//            x: e.clientX - rect.left,
//            y: e.clientY - rect.top
//        };
//    }
//    private MouseScrolling(e: WheelEvent) {
//        var wanted = this.data.ZoomLevel - Math.floor(e.deltaY / 100);
//        if (wanted < 2 || wanted > 10) return;
//        this.data.ZoomLevel = wanted;
//        this.UpdateTilePos(e);
//        this.Redraw();
//    }

//    private Redraw() {
//        if (this.paintContext == null || this.paintCanvas == null) return;
//        this.paintContext.fillStyle = "#111111";
//        this.paintContext.fillRect(0, 0, this.paintCanvas.width, this.paintCanvas.height);
//        for (var i = 0; i < this.paintData.length; i++) {
//            if (this.paintData[i] > 0) {
//                const y = Math.floor(i / this.data.SpriteWidth);
//                const x = i - y * this.data.SpriteWidth;
//                this.PaintPixel(x, y, "#000066");
//            }
//        }
//    }

//    private GetRandomColor() {
//        var letters = '0123456789ABCDEF';
//        var color = '#';
//        for (var i = 0; i < 6; i++) {
//            color += letters[Math.floor(Math.random() * 16)];
//        }
//        return color;
//    }
//}