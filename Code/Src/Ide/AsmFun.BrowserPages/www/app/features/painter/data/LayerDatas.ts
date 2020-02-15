// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion
export interface ILayerManagerData {
    Layers: IUILayer[];
    SelectedLayer: IUILayer | null;
    AddLayer: () => void;
    RemoveLayer: (l: IUILayer) => void;
    SelectLayer: (l: IUILayer) => void;
    ChangeLayerVisibility: (l: IUILayer) => void;
    valueChanged: () => void;
}

export function NewLayerManagerData(): ILayerManagerData {
    return {
        Layers: [],
        SelectedLayer: null,
        AddLayer: () => { },
        RemoveLayer: () => { },
        SelectLayer: () => { },
        ChangeLayerVisibility: () => { },
        valueChanged: () => { },
    };
}

export interface ILayerInternal {
    Index: number;
    UILayer: IUILayer,
    PixelData: number[]
}

export interface IUILayer {
    Name: string;
    IsSelected: boolean;
    IsVisible: boolean;
}