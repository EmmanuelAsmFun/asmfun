
export interface IPopupWindow {
    CanOpenPopup: (canOpen:IPopupEventData) => void;
    OpeningPopup: () => void;
    ClosingPopup: () => void;
    GetData(): IPopupWindowData;
}
export interface IPopupWindowData {
    isVisible: boolean;
    isVisiblePopup: boolean;
}

export interface IPopupSubscription {
    Open();
    Close();
    SwitchState(state: boolean | null);
    Dispose();
}

export interface IPopupManager {
    InvokeLayerIsOpen(layerIndex: number, state: boolean);
    Subscribe(layerIndex: number, window: IPopupWindow): IPopupSubscription;
    Unsubscribe(subscription: IPopupSubscription);
    Open(subscription: IPopupSubscription, state: boolean | null);
    SubscribeLayer(layerIndex: number, doOpen: () => void | null, doClose: () => void | null): IPopupLayerSubscription;
    UnsubscribeLayer(subscription: IPopupLayerSubscription);
}

export interface IPopupEventData {
    SetCanOpen(state: boolean);
} 

export interface IPopupLayerSubscription {
    Dispose();
}
