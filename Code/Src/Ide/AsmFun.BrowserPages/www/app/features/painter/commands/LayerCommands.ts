// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IUILayer, ILayerInternal } from '../data/LayerDatas.js'
import { BaseCommand } from '../../../framework/commands/CommandsCommon.js';
import { BaseEvent } from '../../../framework/data/EventsCommon.js';

export class LayerSelectCommand extends BaseCommand {
    public Layer: IUILayer | null;
    public constructor(layer: IUILayer | null) {
        super();
        this.Layer = layer;
        this.commandName = "Select";
        this.nameSpace = "Layer";
    }
}
export class LayerSelectionChanged extends BaseEvent {
    public Layer: ILayerInternal | null;
    public constructor(layer: ILayerInternal | null) {
        super();
        this.Layer = layer;
        this.eventName = "SelectionChanged";
        this.nameSpace = "Layer";
    }
}

export class LayerChangeVisibilityCommand extends BaseCommand {
    public Layer: IUILayer | null;
    public State: boolean;
    public constructor(layer: IUILayer | null, state: boolean) {
        super();
        this.Layer = layer;
        this.State = state;
        this.commandName = "ChangeVisibility";
        this.nameSpace = "Layer";
    }
}
export class LayerVisibilityChanged extends BaseEvent {
    public layer: ILayerInternal | null;
    public constructor(layer: ILayerInternal | null) {
        super();
        this.layer = layer;
        this.eventName = "VisibilityChanged";
        this.nameSpace = "Layer";
    }
}

