export interface IGridControlSettings {
    ZoomChanged: (oldValue:number, newValue:number) => void;
    CellChanged: (x: IGridCellChanged) => void;
    ElementId: string | null;
    CellHiliteElementId: string | null;
    EnableMouse: boolean;
    EnableKeys: boolean;
}

export interface IGridControlData {
    IsSelectionEnable: boolean;
    IsMoving: boolean;
    MouseScroll: (e: WheelEvent) => void;
    SwapGridVisibility: () => void;
    ActivateControl: () => void;
    IsActive: boolean;
    IsDragging: boolean;
    IsGridVisible: boolean;
    CellWidth: number;
    CellHeight: number;
    ViewOffsetX: number;
    ViewOffsetY: number;
    Width: number;
    Height: number;
    MouseCellX: number;
    MouseCellY: number;
    RealMouseCellX: number;
    RealMouseCellY: number;
    ZoomLevel: number;
    PixelCellX: number;
    PixelCellY: number;
    PixelCellW: number;
    PixelCellH: number;
   
}

export function NewGridControlData(): IGridControlData {
    return {
        CellWidth: 8,
        CellHeight: 8,
        MouseCellX: 0,
        MouseCellY: 0,
        ViewOffsetX: 0,
        ViewOffsetY: 0,
        RealMouseCellX: 0,
        RealMouseCellY: 0,
        Width: 48,
        Height: 48,
        ZoomLevel: 5,
        IsDragging: false,
        IsActive: false,
        ActivateControl: () => { },
        MouseScroll: () => { },
        SwapGridVisibility: () => { },
        IsGridVisible: false,
        IsMoving: false,
        PixelCellW: 10,
        PixelCellH: 10,
        PixelCellX: 0,
        PixelCellY: 0,
        IsSelectionEnable: false,
    };
}

export interface IGridCellChanged {
    IsMouseInside: boolean,
    CellX: number,
    CellY: number,
    DragOffsetX: number,
    DragOffsetY: number,
    ViewOffsetX: number,
    ViewOffsetY: number,
    IsMoving: boolean,
    IsDragging: boolean,
    IsMouseDown: boolean,
    IsMouseCellOutsideArea: boolean,
    AltKey: boolean,
    ShiftKey: boolean,
    CtrlKey: boolean,
}
