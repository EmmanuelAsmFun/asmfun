// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { ILayerManagerData, ILayerInternal, IUILayer } from "./data/LayerDatas.js";
import { ConfirmIcon } from "../../common/Enums.js";
import { LayerSelectionChanged, LayerVisibilityChanged, LayerSelectCommand } from "./commands/LayerCommands.js";
import { IMainData } from "../../framework/data/MainData.js";


export class LayerContainer {
    private mainData: IMainData;
    private layers: ILayerInternal[] = [];
    private selectedLayer: ILayerInternal | null = null;
    private data: ILayerManagerData;
    private width: number = 0;
    private height: number = 0;

    constructor(mainData: IMainData, data: ILayerManagerData) {
        this.mainData = mainData;
        this.data = data;
        this.data.AddLayer = () => this.AddLayer();
        this.data.RemoveLayer = (l) => this.RemoveLayer(l);
        this.data.SelectLayer = (l) => this.SelectUILayer(l);
        this.data.ChangeLayerVisibility = (l) => this.ChangeLayerVisibility(l);
        this.mainData.commandManager.Subscribe2(new LayerSelectCommand(null), this, x => this.SelectUILayer(x.Layer));
    }

    public SetSize(width: number, height: number) {
        this.width = width;
        this.height = height;
    }

    //#region layers
    public AddLayer() {
        var layer: ILayerInternal = {
            PixelData: Array.from({ length: this.width * this.height }),
            Index: 0,
            UILayer: {
                Name: "Background",
                IsVisible: true,
                IsSelected: false,
            }
        };
        layer.PixelData.fill(0);
        this.data.Layers.splice(0, 0, layer.UILayer);
        this.layers.splice(0, 0, layer);
        this.UpdateLayerIndex();
    }

    private RemoveLayer(layer: IUILayer | null) {
        if (this.data.Layers.length <= 1) return;
        if (layer == null)
            layer = this.data.SelectedLayer;
        if (layer == null) return;
        const index = this.data.Layers.indexOf(layer);
        if (index < 0)
            return;
        this.mainData.appData.alertMessages.Confirm("Are you sure?", "Are you sure you ant to delete '" + layer.Name + "' ?", ConfirmIcon.Question, (r) => {
            if (layer == null) return;
            if (r) {
                this.data.Layers.splice(index, 1);
                this.layers.splice(index, 1);
                // Select another layer
                if (layer.IsSelected)
                    this.SelectFirstLayer();
                this.UpdateLayerIndex();
            }
        });
    }

    private UpdateLayerIndex() {
        for (var i = 0; i < this.layers.length; i++) {
            this.layers[i].Index = i;
        }
    }

    private SelectUILayer(layer: IUILayer | null) {
        if (layer == null) return;
        var layerIndex = this.data.Layers.indexOf(layer);
        if (layerIndex < 0) return;
        this.SelectLayer(this.layers[layerIndex]);
    }

    private SelectLayer(internalLayer: ILayerInternal) {
        if (internalLayer == null) return;
        // deselect previous
        if (this.selectedLayer != null)
            this.selectedLayer.UILayer.IsSelected = false;
        internalLayer.UILayer.IsSelected = true;
        this.data.SelectedLayer = internalLayer.UILayer;
        this.selectedLayer = internalLayer;
        this.mainData.eventManager.InvokeEvent(new LayerSelectionChanged(this.selectedLayer));
        return true;
    }

    private ChangeLayerVisibility(layer: IUILayer) {
        if (layer == null) return;
        var internalLayer = this.layers.find(x => x.UILayer == layer);
        if (internalLayer == null) return;
        layer.IsVisible = !layer.IsVisible;
        this.mainData.eventManager.InvokeEvent(new LayerVisibilityChanged(internalLayer));
    }


    public SelectFirstLayer() {
        return this.SelectLayer(this.layers[0]);
    }

    public SetLayerPixelData(data : number[]) {
        if (this.selectedLayer == null) return false;
        this.selectedLayer.PixelData = data;
        return true;
    }

    public GetSelectedLayer(): ILayerInternal | null {
        return this.selectedLayer;
    }

   
    public GetSelectedUILayer(): IUILayer | null {
        if (this.selectedLayer == null) return null;
        return this.selectedLayer.UILayer;
    }
    //#endregion layers

    public HasOverlayingPixel(layerIndex: number, pos: number): boolean {
        var needPaint = true;
        for (var i = 0; i < layerIndex; i++) {
            if (this.layers[i].UILayer.IsVisible && this.layers[i].PixelData[pos] > 0) {
                needPaint = false;
                break;
            }
        }
        return needPaint;
    }

    public GetMergedPixels(): number[] {
        var w = this.width;
        var h = this.height;
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
        return resultArray;
    }

    public HasLayerPixel(layer: ILayerInternal, pos: number): boolean {
        return layer.UILayer.IsVisible && layer.PixelData[pos] > 0;
    }


}