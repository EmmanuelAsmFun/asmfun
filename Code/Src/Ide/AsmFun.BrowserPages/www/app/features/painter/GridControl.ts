// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IGridControlData, IGridControlSettings } from "./data/GridControlData.js";
import { IUIControl } from "../../framework/IUIControl.js";
import { IControlManager } from "../../framework/IControlManager.js";
import { GridSelection, GridSelectionAction } from "./GridSelection.js";

export class GridControl implements IUIControl{

    private data: IGridControlData;
    private settings: IGridControlSettings;
    private selection: GridSelection;
    private gridElement: HTMLDivElement | null = null;
    private CellHiliteElement: HTMLDivElement | null = null;
    private overlayCanvasElement: HTMLCanvasElement | null = null;
    private overlayCanvasContext: CanvasRenderingContext2D | null = null;
    
    private controlManager: IControlManager;

    private lastMousePos: { x: number, y: number } = { x: 0, y: 0 };
    private shiftKey = false;
    private ctrlKey = false;
    private altKey = false;

    private lastCellX: number = 0;
    private lastCellY: number = 0;
    private startDragX = -1;
    private startDragY = -1;
    private dragOffsetX = 0;
    private dragOffsetY = 0;

    private startViewX = 0;
    private startViewY = 0;
    private viewMaxCellX = 0;
    private viewMaxCellY = 0;
    private viewPixelWidth = 100;
    private viewPixelHeight = 100;



    private mouseIsInside = false;
    private isMouseDown = false;
    private isMouseOutsideCellArea = false;
    private isMouseOutsideViewCellArea = false;

    

    public constructor(setup: IGridControlSettings, data: IGridControlData, controlManager: IControlManager, controlGroupName: string, selection: GridSelection) {
        this.controlManager = controlManager;
        this.selection = selection;
        this.data = data;
        this.data.ControlGroupName = controlGroupName;
        this.data.MouseScroll = e => this.MouseScrolling(e);
        this.data.SwapGridVisibility = () => {
            if (this.data.IsGridVisible)
                this.HideGridLines();
            else
                this.ShowGridLines();
        };
        this.settings = setup;
        
    }

    public Start() {
        this.InitElements();
        this.controlManager.Subscribe(this);

        if (this.gridElement == null) return;
        if (this.settings.EnableMouse)
            this.EnableMouse();
        if (this.settings.EnableKeys)
            this.EnableKeys();
        this.ShowGridLines();
        this.UpdateZoom();
    }

    public Stop() {
        this.controlManager.Unsubscribe(this);
        this.DisableMouse();
        this.DisableKeys();
        this.DestroyElements();
    }

    private MouseDown(e: MouseEvent) {
        this.ParseMouseData(e);
        if (this.gridElement == null) return;
        this.controlManager.Activate(this);
       
        this.isMouseDown = true;
        this.startDragX = this.data.MouseCellX;
        this.startDragY = this.data.MouseCellY;
        this.startViewX = this.data.ViewOffsetX;
        this.startViewY = this.data.ViewOffsetY;
        this.lastCellY = -1;
        this.lastCellX = -1;
        this.UpdateMouseCell();
        this.SetMousePointer();
        if (!this.data.IsMoving)
            this.SelectionStart(this.data.RealMouseCellX, this.data.RealMouseCellY);
    }

    public SelectionStart(x: number, y: number) {
        var action: GridSelectionAction = GridSelectionAction.Unknown;
        if (!this.ctrlKey && !this.shiftKey && !this.altKey)
            action = GridSelectionAction.Clear;
        else if (!this.ctrlKey && this.shiftKey && !this.altKey) 
            action = GridSelectionAction.Add;
        else if (!this.ctrlKey && !this.shiftKey && this.altKey) 
            action = GridSelectionAction.Remove;
        this.selection.SelectionStart(x, y, action);
    }

    private MouseUp(e: MouseEvent) {
        this.ParseMouseData(e);
        this.isMouseDown = false;
        this.data.IsDragging = false;
        this.lastCellY = -1;
        this.lastCellX = -1;
        this.startDragX = -1;
        this.startDragY = -1;
        this.selection.SelectionStop(this.data.RealMouseCellX, this.data.RealMouseCellY);
    }
   
    private MouseMoving(e: MouseEvent) {
        this.ParseMouseData(e);
        if (this.isMouseDown && !this.data.IsMoving)
            this.data.IsDragging = true;
        this.UpdateMouseCell();
        // Absorb same cell
        if (this.lastCellX == this.data.MouseCellX && this.lastCellY == this.data.MouseCellY) return;
        this.lastCellX = this.data.MouseCellX;
        this.lastCellY = this.data.MouseCellY;
        this.data.PixelCellX = this.data.MouseCellX * this.data.CellWidth * this.data.ZoomLevel;
        this.data.PixelCellY = this.data.MouseCellY * this.data.CellHeight * this.data.ZoomLevel;
        if (this.data.IsMoving && this.isMouseDown) {
            this.dragOffsetX = -(this.startDragX - this.data.MouseCellX)
            this.dragOffsetY = -(this.startDragY - this.data.MouseCellY);
            this.data.ViewOffsetX = this.startViewX + this.dragOffsetX;
            this.data.ViewOffsetY = this.startViewY + this.dragOffsetY;
        }
        this.data.RealMouseCellX = this.data.MouseCellX - this.data.ViewOffsetX;
        this.data.RealMouseCellY = this.data.MouseCellY - this.data.ViewOffsetY;
        this.CellChanged();
        if (this.data.IsMoving && this.isMouseDown) {
            this.Move();
        }
        else if (this.isMouseDown) {
            this.selection.SelectionChange(this.data.RealMouseCellX, this.data.RealMouseCellY);
        }
    }

    private Move() {
        this.RedrawGrid();
        this.selection.RedrawSelection();
    }

    private CellChanged() {
        this.isMouseOutsideCellArea =
            this.data.MouseCellX < 0 || this.data.MouseCellX >= this.data.Width  ||
            this.data.MouseCellY < 0 || this.data.MouseCellY >= this.data.Height ;
        this.isMouseOutsideViewCellArea =
            this.data.MouseCellX < 0 || this.data.MouseCellX >= this.viewMaxCellX ||
            this.data.MouseCellY < 0 || this.data.MouseCellY >= this.viewMaxCellY;
        this.MoveHiliteCell();
        
        this.settings.CellChanged({
            CellX: this.data.MouseCellX,
            CellY: this.data.MouseCellY,
            IsDragging: this.data.IsDragging,
            IsMouseInside: this.mouseIsInside,
            IsMoving: this.data.IsMoving,
            IsMouseCellOutsideArea: this.isMouseOutsideCellArea,
            IsMouseDown: this.isMouseDown,
            DragOffsetX: this.dragOffsetX,
            DragOffsetY: this.dragOffsetY,
            ViewOffsetX: this.data.ViewOffsetX,
            ViewOffsetY: this.data.ViewOffsetY,
            AltKey: this.altKey,
            CtrlKey: this.ctrlKey,
            ShiftKey: this.shiftKey,
        });
    }

    /** Updates on which cell the mouse is hover */
    private UpdateMouseCell() {
        if (this.gridElement == null) return;
        this.data.MouseCellX = Math.floor(this.lastMousePos.x / (this.data.CellWidth * this.data.ZoomLevel));
        this.data.MouseCellY = Math.floor(this.lastMousePos.y / (this.data.CellHeight * this.data.ZoomLevel));
    }

    private MouseScrolling(e: WheelEvent) {
        if (e.ctrlKey) {
            this.ChangeZoom(e);
            this.MouseMoving(e);
            e.cancelBubble = true;
            e.preventDefault();
        }
    }

    private ChangeZoom(e: WheelEvent) {
        this.ParseMouseData(e);
        var previous = this.data.ZoomLevel;
        var wanted = this.data.ZoomLevel - Math.floor(e.deltaY / 100);
        if (wanted < 1 || wanted > 10) return;
        this.data.ZoomLevel = wanted;
        this.UpdateMouseCell();
        this.UpdateZoom();
        this.settings.ZoomChanged(previous, this.data.ZoomLevel);
    }

    private UpdateZoom() {
        this.data.PixelCellW = this.data.ZoomLevel * this.data.CellWidth;
        this.data.PixelCellH = this.data.ZoomLevel * this.data.CellHeight;
        this.viewMaxCellX = Math.ceil(this.viewPixelWidth / this.data.PixelCellW);
        this.viewMaxCellY = Math.ceil(this.viewPixelHeight / this.data.PixelCellH);
        this.ResizeHiliteCell();
        this.RedrawGrid(); 
        this.selection.RedrawSelection();
    }


    private InitElements() {
        if (this.settings.ElementId != null)  this.gridElement = <HTMLDivElement | null>document.getElementById(this.settings.ElementId);
        if (this.settings.CellHiliteElementId != null) this.CellHiliteElement = <HTMLDivElement | null>document.getElementById(this.settings.CellHiliteElementId);
        if (this.gridElement != null) {
            this.viewPixelWidth = this.gridElement.clientWidth;
            this.viewPixelHeight = this.gridElement.clientWidth;

            // Grid canvas
            this.overlayCanvasElement = <HTMLCanvasElement>document.createElement("CANVAS");
            this.overlayCanvasElement.width = this.viewPixelWidth;
            this.overlayCanvasElement.height = this.viewPixelHeight;
            this.overlayCanvasElement.id = this.gridElement.id + "Canvas";
            this.overlayCanvasElement.style.position = "absolute";
            this.overlayCanvasElement.style.zIndex = "40";
            this.overlayCanvasContext = this.overlayCanvasElement.getContext("2d");
            this.gridElement.appendChild(this.overlayCanvasElement);

            // Select canvas
            var canvas = this.selection.Create(this.viewPixelWidth, this.viewPixelHeight, this.gridElement.id);
            this.gridElement.appendChild(canvas);
        }
    }
    private DestroyElements() {
        if (this.gridElement != null && this.overlayCanvasElement != null) {
            this.gridElement.removeChild(this.overlayCanvasElement);
        }
    }



    //#region Cell hilite
    private MoveHiliteCell() {
        if (this.CellHiliteElement == null || this.isMouseOutsideViewCellArea || this.isMouseOutsideCellArea) return;
        // -1 for the border
        this.CellHiliteElement.style.left = (this.data.PixelCellX -1) + "px";
        this.CellHiliteElement.style.top = (this.data.PixelCellY-1) + "px";
    }

    private ResizeHiliteCell() {
        if (this.CellHiliteElement == null) return;
        this.CellHiliteElement.style.width = this.data.PixelCellW + "px";
        this.CellHiliteElement.style.height = this.data.PixelCellH + "px";
    }
    //#endregion Cell hilite


    //#region Grid
    public ShowGridLines() {
        if (this.overlayCanvasElement == null) return;
        this.overlayCanvasElement.style.display = "block";
        this.data.IsGridVisible = true;
        this.RedrawGrid();
    }
     
    public HideGridLines() {
        if (this.overlayCanvasElement == null) return;
        this.overlayCanvasElement.style.display = "none";
        this.data.IsGridVisible = false;
    }

    private RedrawGrid() {
        if (!this.data.IsGridVisible) return;
        if (this.overlayCanvasContext == null || this.overlayCanvasElement == null) return;
        var ctx = this.overlayCanvasContext;

        var w = Math.min(this.overlayCanvasElement.width, this.data.Width * this.data.PixelCellW);
        var h = Math.min(this.overlayCanvasElement.height, this.data.Height * this.data.PixelCellH);
        var xOffset = this.data.ViewOffsetX * this.data.PixelCellW;
        var yOffset = this.data.ViewOffsetY * this.data.PixelCellH;
        ctx.clearRect(0, 0, this.overlayCanvasElement.width, this.overlayCanvasElement.height);
        ctx.strokeStyle = "#55999955";
        for (let x = 0; x <= this.data.Width; x++) {
            if ((x + 1) % 2 == 0)
                ctx.strokeStyle = "#55999933";
            else
                ctx.strokeStyle = "#55999966";
            ctx.beginPath();
            ctx.moveTo(x * this.data.PixelCellW + xOffset, yOffset);
            ctx.lineTo(x * this.data.PixelCellW + xOffset, h + yOffset );
            ctx.stroke();
            
        }
        for (let y = 0; y <= this.data.Height; y++) {
            if ((y + 1) % 2 == 0)
                ctx.strokeStyle = "#55999933";
            else
                ctx.strokeStyle = "#55999966";
            ctx.beginPath();
            ctx.moveTo(0 + xOffset, y * this.data.PixelCellH + yOffset);
            ctx.lineTo(w + xOffset, y * this.data.PixelCellH + yOffset);
            ctx.stroke();
        }
    }
    //#endregion Grid


    //#region Mouse
    public EnableMouse() {
        if (this.gridElement == null) return;
        this.gridElement.addEventListener('mousemove', (e: MouseEvent) => this.MouseMoving(e), false);
        this.gridElement.addEventListener('mousedown', (e: MouseEvent) => this.MouseDown(e), false);
        this.gridElement.addEventListener('mouseup', (e: MouseEvent) => this.MouseUp(e), false);
        this.gridElement.addEventListener('mouseenter', (e: MouseEvent) => this.MouseEnter(), false);
        this.gridElement.addEventListener('mouseleave', (e: MouseEvent) => this.MouseLeave(), false);
    }
    public DisableMouse() {
        if (this.gridElement == null) return;
        this.gridElement.removeEventListener('mousemove', (e: MouseEvent) => this.MouseMoving(e), false);
        this.gridElement.removeEventListener('mousedown', (e: MouseEvent) => this.MouseDown(e), false);
        this.gridElement.removeEventListener('mouseup', (e: MouseEvent) => this.MouseUp(e), false);
        this.gridElement.removeEventListener('mouseenter', (e: MouseEvent) => this.MouseEnter(), false);
        this.gridElement.removeEventListener('mouseleave', (e: MouseEvent) => this.MouseLeave(), false);
    }
    private SetMousePointer() {
        if (this.gridElement == null) return;
        if (this.data.IsMoving)
            this.gridElement.style.cursor = "move";
        else
            this.gridElement.style.cursor = "crosshair";
    }

    private MouseEnter() { this.mouseIsInside = true; }
    private MouseLeave() { this.mouseIsInside = false; this.isMouseOutsideCellArea = false; }


    private GetMousePosition(e: MouseEvent) {
        if (this.gridElement == null) return { x: 0, y: 0 };
        var rect = this.gridElement.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    private ParseMouseData(e: MouseEvent) {
        this.lastMousePos = this.GetMousePosition(e);
        this.shiftKey = e.shiftKey;
        this.ctrlKey = e.ctrlKey;
        this.altKey = e.altKey;
    }
    //#endregion Mouse


    //#region Keys
    public EnableKeys() {
        window.addEventListener('keyup', (e: KeyboardEvent) => this.KeyUp(e), false);
        window.addEventListener('keydown', (e: KeyboardEvent) => this.KeyDown(e), false);
    }

    public DisableKeys() {
        window.removeEventListener('keyup', (e: KeyboardEvent) => this.KeyUp(e), false);
        window.removeEventListener('keydown', (e: KeyboardEvent) => this.KeyDown(e), false);
    }

    private KeyDown(k: KeyboardEvent): any {
        if (k.key == " ") {
            this.data.IsMoving = true;
            this.SetMousePointer();
        }
        if (this.data.IsActive) {
            this.ctrlKey = k.ctrlKey;
            this.shiftKey = k.shiftKey;
            this.altKey = k.altKey;
            var allowContinueEmit = true;
            switch (k.which) {
                // Cursor
                case 37: allowContinueEmit = this.MoveLeft(); break;    // Left
                case 38: allowContinueEmit = this.MoveUp(); break;      // Up
                case 39: allowContinueEmit = this.MoveRight(); break;   // Right
                case 40: allowContinueEmit = this.MoveDown(); break;    // Down
                case 27: // Escape
                    this.selection.ClearSelection();
                    allowContinueEmit = false;
                    break;                  
                // Text edit
                case 13: allowContinueEmit = this.EnterKey(); break;   // EnterKey
            }
            if (!allowContinueEmit) {
                k.cancelBubble = true;
                k.preventDefault();
            }
        }
    }
    private KeyUp(k: KeyboardEvent): any {
        if (k.key == " ") {
            this.data.IsMoving = false;
            this.SetMousePointer();
        }
    }
    private MoveLeft(): boolean {
        if (this.data.IsMoving) {
            this.data.ViewOffsetX -= this.shiftKey ? 5 : 1;
            this.Move();
            return false;
        }
        return true;
    }
    private MoveRight(): boolean {
        if (this.data.IsMoving) {
            this.data.ViewOffsetX += this.shiftKey ? 5 : 1;
            this.Move();
            return false;
        }
        return true;
    }
    private MoveUp(): boolean {
        if (this.data.IsMoving) {
            this.data.ViewOffsetY -= this.shiftKey ? 5 : 1;
            this.Move();
            return false;
        }
        return true;
    }
    private MoveDown(): boolean {
        if (this.data.IsMoving) {
            this.data.ViewOffsetY += this.shiftKey ? 5 : 1;
            this.Move();
            return false;
        }
        return true;
    }
    private EnterKey() {
        return false;
    }
    //#endregion Keys

    public ActivateControl(): void {
        if (this.data.IsActive == true) return;
        this.data.IsActive = true;
    }
    public DeactivateControl(): void {
        if (this.data.IsActive == false) return;
        this.data.IsActive = false;
    }
    public GetIsActifState(): boolean {
        return this.data.IsActive;
    }
    public GetControlGroup(): string {
        return this.data.ControlGroupName;
    }
}