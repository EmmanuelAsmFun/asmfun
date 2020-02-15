import { IGridSelectionData, IGridControlData, GridSelectionType } from "./data/GridControlData.js";

export enum GridSelectionAction {
    Unknown,
    Add,
    Remove,
    Clear
}

export class GridSelection {
    private selectionAction: GridSelectionAction = GridSelectionAction.Unknown;
    private data: IGridSelectionData;
    private gridData: IGridControlData;
    private selectedCells: boolean[][] = [];
    private doSetSelection = false;
    private previousWasSelected = false;
    private startCell: { x: number, y: number } = { x: 0, y: 0 };

    private selectCanvasElement: HTMLCanvasElement | null = null;
    private selectCanvasContext: CanvasRenderingContext2D | null = null;

    constructor(selectionData: IGridSelectionData, gridData: IGridControlData) {
        this.data = selectionData;
        this.data.SetSelectType = (t) => this.data.SelectionType = t;
        this.gridData = gridData;
    }

    public Create(width: number, height: number, parentElementId:string) {
        // Select canvas
        this.selectCanvasElement = <HTMLCanvasElement>document.createElement("CANVAS");
        this.selectCanvasElement.width = width;
        this.selectCanvasElement.height = height;
        this.selectCanvasElement.id = parentElementId + "Canvas";
        this.selectCanvasElement.style.position = "absolute";
        this.selectCanvasElement.style.zIndex = "50";
        this.selectCanvasContext = this.selectCanvasElement.getContext("2d");
        return this.selectCanvasElement;
    }


    //#region Selection
    public SelectionStart(x: number, y: number, action: GridSelectionAction) {
        if (!this.data.IsSelectionEnable) return;
        this.selectionAction = action;
        if (action == GridSelectionAction.Clear)
            this.ClearSelection();
        if (this.selectedCells[x] == undefined) this.selectedCells[x] = [];
        this.previousWasSelected = this.selectedCells[x][y] === true;
        this.doSetSelection = true;
        this.startCell = { x: x, y: y };
        if (action == GridSelectionAction.Add) {
            this.SelectCell(x, y);
            this.doSetSelection = true;
        }
        if (action == GridSelectionAction.Remove) {
            this.doSetSelection = false;
            this.DeselectCell(x, y);
        }
    }

    public SelectionStop(x: number, y: number) {
        if (!this.data.IsSelectionEnable) return;
    }

    public SelectionChange(x: number, y: number) {
        if (!this.data.IsSelectionEnable) return;
        if (this.doSetSelection)
            this.SelectCell(x, y);
        else
            this.DeselectCell(x, y);
    }

    public SelectCell(x: number, y: number) {
        if (!this.data.IsSelectionEnable) return;
        if (x < 0 || y < 0) return;
        if (this.selectedCells[x] == undefined) this.selectedCells[x] = [];
        var xCount = this.startCell.x - x;
        var yCount = this.startCell.y - y;
        if (this.data.SelectionType === GridSelectionType.Rect) {
            this.SelectRect(x, y, xCount, yCount, true);
        }
        else if (this.data.SelectionType === GridSelectionType.Circle) {
            this.SelectCircle(this.startCell.x, this.startCell.y, x, y, true);
        }
        else if (this.data.SelectionType === GridSelectionType.Line) {
            this.SelectLine(this.startCell.x, this.startCell.y, x, y, true);
        }
        else {
            this.selectedCells[x][y] = true;
            this.RedrawSelection();
        }
    }
   
    public DeselectCell(x: number, y: number) {
        if (!this.data.IsSelectionEnable) return;
        if (this.selectedCells[x] == undefined) this.selectedCells[x] = [];
        var xCount = this.startCell.x - x;
        var yCount = this.startCell.y - y;
        if (this.data.SelectionType === GridSelectionType.Rect) {
            this.SelectRect(x, y, xCount, yCount, false);
        }
        else if (this.data.SelectionType === GridSelectionType.Circle) {
            this.SelectCircle(this.startCell.x, this.startCell.y,x, y, false);
        }
        else if (this.data.SelectionType === GridSelectionType.Line) {
            this.SelectLine(this.startCell.x, this.startCell.y, x, y, false);
        }
        else {
            this.selectedCells[x][y] = false;
            this.RedrawSelection();
        }
    }

  

    private SelectRect(x: number, y: number, width: number, height: number, state: boolean) {
        if (this.selectionAction !== GridSelectionAction.Add && this.selectionAction !== GridSelectionAction.Remove)
            this.ClearSelection();
        var startX = x;
        var startY = y;
        var xCount = width;
        var yCount = height;
        if (width < 0) {
            startX = x + width;
            xCount = -width;
        }
        if (height < 0) {
            startY = y + height;
            yCount = -height;
        }
        for (var i = 0; i <= xCount; i++) {
            for (var y = 0; y <= yCount; y++) {
                if (this.selectedCells[startX + i] == undefined) this.selectedCells[startX + i] = [];
                this.selectedCells[startX + i][startY + y] = state;
            }
        }
        this.RedrawSelection();
    }

    private SelectCircle(x1: number, y1: number, x2: number, y2: number, state: boolean) {
        if (this.selectionAction !== GridSelectionAction.Add && this.selectionAction !== GridSelectionAction.Remove)
            this.ClearSelection();
       
        var length = Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2));
        //console.log(x1 + "x" + y1 + " - " + x2 + "x" + y2, length);
        
        var h = x1; // x coordinate of circle center
        var k = y1; // y coordinate of circle center
        var step = 2 * Math.PI / 100;
        var r = length;
        for (var theta = 0; theta < Math.PI ; theta += step) {
            var xx = Math.round(h + r * Math.cos(theta));
            var yy = Math.round(k - r * Math.sin(theta)); 
            var yMirror = Math.round(k + r * Math.sin(theta));
            if (this.selectedCells[xx] == undefined) this.selectedCells[xx] = [];
            this.selectedCells[xx][yy] = state;
            this.selectedCells[xx][yMirror] = state;
            this.SelectLine(xx, yy, xx, yMirror, state, false);
        }
        this.RedrawSelection();
    }

    public SelectLine(x1: number, y1: number, x2: number, y2: number, state: boolean, redrawSelection: boolean = true) {
        if (redrawSelection)
            this.ClearSelection();
        if (x1 > x2) {
            const tx1 = x1;
            x1 = x2;
            x2 = tx1;
            const ty1 = y1;
            y1 = y2;
            y2 = ty1;
        }
        if (y1 > y2) {
           
        }
        //var length = Math.round( Math.sqrt(Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2)));
        //console.log(x1 + "x" + y1 + " - " + x2 + "x" + y2, length);
        var dx = x2 - x1;
        var dy = y2 - y1;
        if (dx > 0) {
            for (var x = x1; x <= x2; x += 0.01) {
                var y = Math.round(y1 + (dy * (x - x1)) / dx);
                var newX = Math.round(x);
                if (this.selectedCells[newX] == undefined) this.selectedCells[newX] = [];
                this.selectedCells[newX][y] = state;
            }
        }
        else {
            for (var y = y1; y <= y2; y += 0.01) {
                var x = Math.round(x1 + (dx * (y - y1)) / dy);
                var newY = Math.round(y);
                if (this.selectedCells[x] == undefined) this.selectedCells[x] = [];
                this.selectedCells[x][newY] = state;
            }
        }
        if (redrawSelection)
            this.RedrawSelection();
    }


    public RedrawSelection(alternate: boolean = false) {
        clearTimeout(this.selectionTimout);
        if (this.selectCanvasContext == null || this.selectCanvasElement == null) return;
        var ctx = this.selectCanvasContext;
        ctx.clearRect(0, 0, this.selectCanvasElement.width, this.selectCanvasElement.height);
        if (this.selectedCells.length == 0) return;

        var xOffset = this.gridData.ViewOffsetX * this.gridData.PixelCellW;
        var yOffset = this.gridData.ViewOffsetY * this.gridData.PixelCellH;

        ctx.fillStyle = "#00000011";
        ctx.strokeStyle = "#CCCCCC";
        ctx.shadowBlur = 0;
        ctx.shadowColor = "black";
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        if (alternate)
            ctx.setLineDash([3, 7]);
        else
            ctx.setLineDash([5, 5]);


        for (var x = 0; x < this.gridData.Width; x++) {
            var xRange = this.selectedCells[x];
            for (var y = 0; y < this.gridData.Height; y++) {
                var selX = x * this.gridData.PixelCellW + xOffset;
                var selY = y * this.gridData.PixelCellH + yOffset;
                if (xRange == undefined || xRange[y] != true) {
                    //ctx.fillRect(selX, selY, this.gridData.PixelCellW, this.gridData.PixelCellH);
                    continue;
                }

                if (x - 1 >= 0 && this.selectedCells[x - 1] == null) this.selectedCells[x - 1] = [];
                if (this.selectedCells[x + 1] == null) this.selectedCells[x + 1] = [];
                ctx.beginPath();
                // Left Line
                if (this.selectedCells[x - 1] != null && this.selectedCells[x - 1][y] != true) {
                    ctx.moveTo(selX, selY);
                    ctx.lineTo(selX, selY + this.gridData.PixelCellH);
                } else {
                    ctx.moveTo(selX, selY + this.gridData.PixelCellH);
                }
                // Bottom Line
                if (this.selectedCells[x] != null && this.selectedCells[x][y + 1] != true)
                    ctx.lineTo(selX + this.gridData.PixelCellW, selY + this.gridData.PixelCellH);
                else
                    ctx.moveTo(selX + this.gridData.PixelCellW, selY + this.gridData.PixelCellH);
                // Right Line
                if (this.selectedCells[x + 1] != null && this.selectedCells[x + 1][y] != true)
                    ctx.lineTo(selX + this.gridData.PixelCellW, selY);
                else
                    ctx.moveTo(selX + this.gridData.PixelCellW, selY);
                // Top Line
                if (y > 0 && this.selectedCells[x] != null && this.selectedCells[x][y - 1] != true)
                    ctx.lineTo(selX, selY);
                ctx.stroke();

            }
        }
        this.selectionTimout = setTimeout(() => this.RedrawSelection(!alternate), 300);
    }
    private selectionTimout = 0;

    public ClearSelection() {
        this.selectedCells = [];
        this.RedrawSelection();
    }

    public GetSelection(): boolean[][] {
        return this.selectedCells;
    }
    //#endregion selection

}