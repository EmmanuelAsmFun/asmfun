import { IPopupSubscription, IPopupWindow, IPopupManager, IPopupLayerSubscription } from "./data/IPopupData.js";
import { ServiceName } from "./serviceLoc/ServiceName.js";


export class PopupManager implements IPopupManager {

    private layers: PopupLayer[] = [];


    public Subscribe(layerIndex: number, window: IPopupWindow): IPopupSubscription {
        var subscription = new PopupSubscription(this, window, layerIndex);
        if (this.layers[layerIndex] == undefined) this.layers[layerIndex] = new PopupLayer();
        var layer = this.layers[layerIndex];
        layer.Subscribe(subscription);
        return subscription;
    }

    public Unsubscribe(subscription: IPopupSubscription) {
        var typed = <PopupSubscription>subscription;
        if (this.layers[typed.layerIndex] == undefined) return;
        this.layers[typed.layerIndex].Unsubscribe(typed);
        typed.IsDeleted = true;
    }

    public Open(subscription: IPopupSubscription, state: boolean | null) {
        if (subscription == null) return;
        subscription.SwitchState(state);
    }


    public OpenPopup(subscription: IPopupSubscription) {
        var typed = <PopupSubscription>subscription;
        if (this.layers[typed.layerIndex] == undefined) return;
        this.layers[typed.layerIndex].OpenPopup(typed);
    }

    public ClosePopup(subscription: IPopupSubscription) {
        var typed = <PopupSubscription>subscription;
        if (this.layers[typed.layerIndex] == undefined) return;
        this.layers[typed.layerIndex].ClosePopup(typed);
    }

    /** A popup is Opening, tell all subscribed objects */
    public OpeningPopup(subscription: PopupSubscription) {
        if (this.layers[subscription.layerIndex] == undefined) return;
        this.layers[subscription.layerIndex].OpeningPopup();
    }
    /** A popup is Closing, tell all subscribed objects */
    public ClosingPopup(subscription: PopupSubscription) {
        if (this.layers[subscription.layerIndex] == undefined) return;
        this.layers[subscription.layerIndex].ClosingPopup();
    }

    public SubscribeLayer(layerIndex: number, doOpen: () => void | null, doClose: () => void | null) {
        var subscription = new PopupLayerSubscription(this, layerIndex, doOpen, doClose);
        if (this.layers[layerIndex] == undefined) this.layers[layerIndex] = new PopupLayer();
        var layer = this.layers[layerIndex];
        layer.SubscribeLayer(subscription);
        return subscription;
    }
    public UnsubscribeLayer(subscription: IPopupLayerSubscription) {
        var typed = <PopupLayerSubscription>subscription;
        if (this.layers[typed.layerIndex] == undefined) return;
        this.layers[typed.layerIndex].UnsubscribeLayer(typed);
        typed.IsDeleted = true;
    }

    public InvokeLayerIsOpen(layerIndex: number, state: boolean) {
        if (this.layers[layerIndex] == undefined) return;
        if (state)
            this.layers[layerIndex].OpeningPopup();
        else
            this.layers[layerIndex].ClosingPopup();
    }

    /** Disposes this instance with all the subscriptions. */
    public Dispose() {
        this.layers.forEach(x => {
            x.Dispose();
        });
    }

    public static ServiceName: ServiceName = new ServiceName("PopupManager");

}

class PopupLayer {

    private _items: PopupSubscription[] = [];
    private _layerSubscriptions: PopupLayerSubscription[] = [];

    public Subscribe(subscription: PopupSubscription) {
        this._items.push(subscription);
    }
    public Unsubscribe(subscription: PopupSubscription) {
        var index = this._items.indexOf(subscription);
        if (index > -1)
            this._items.splice(index,1);
    }

    public OpenPopup(subscription: PopupSubscription) {
        // Close the others
        for (var i = 0; i < this._items.length; i++) {
            var sub = this._items[i];
            if (sub == subscription) continue;
            sub.InternalDoClosePopup();
        }
        subscription.InternalDoOpenPopup();
    }
    public ClosePopup(subscription: PopupSubscription) {
        subscription.InternalDoClosePopup();
    }

    /** A popup is Opening, tell all subscribed objects */
    public OpeningPopup() {
        for (var i = 0; i < this._layerSubscriptions.length; i++) {
            this._layerSubscriptions[i].InternalOpening();
        }
    }
    /** A popup is Closing, tell all subscribed objects */
    public ClosingPopup() {
        for (var i = 0; i < this._layerSubscriptions.length; i++) {
            this._layerSubscriptions[i].InternalClosing();
        }
    }


    public SubscribeLayer(subscription: PopupLayerSubscription) {
        this._layerSubscriptions.push(subscription);
    }
    public UnsubscribeLayer(subscription: PopupLayerSubscription) {
        var index = this._layerSubscriptions.indexOf(subscription);
        if (index > -1)
            this._layerSubscriptions.splice(index, 1);
    }

    public Dispose() {
        this._items.forEach(x => {
            x.Dispose();
        });
        this._items = [];
    }

}


/** A subscription to the Command. */
class PopupSubscription implements IPopupSubscription {
    /** The action to execute. */
    private window: IPopupWindow; // Action2<IBaseCommand, ICommandEvent>;
    public layerIndex: number;
    /** If this subscription is deleted. */
    public IsDeleted: boolean = false;
    private manager: PopupManager;

    constructor(manager: PopupManager, window: IPopupWindow, layerIndex: number) {
        this.manager = manager;
        this.window = window;
        this.layerIndex = layerIndex;
    }

    public SwitchState(state: boolean | null) {
        if (state == null)
            state = !this.window.GetData().isVisible;
        if (state === this.window.GetData().isVisible) return;
        if (!state)
            this.Close();
        else
            this.Open();
    }
    public Open() {
        if (this.IsDeleted) return;
        this.manager.OpenPopup(this);
    }
    public Close() {
        if (this.IsDeleted) return;
        this.manager.ClosePopup(this);
    }
    public InternalDoOpenPopup() {
        if (this.IsDeleted) return;
        var thiss = this;
        var evtData = {
            SetCanOpen: (state: boolean) => {
                if (!state) return;
                thiss.manager.OpeningPopup(this);
                thiss.window.GetData().isVisible = true;
                setTimeout(() => {
                    thiss.window.GetData().isVisiblePopup = true;
                    if (thiss.window.OpeningPopup)
                        thiss.window.OpeningPopup();
                }, 10);
            } 
        };
        this.window.CanOpenPopup(evtData);
    }

    public InternalDoClosePopup() {
        if (this.IsDeleted) return;
        if (!this.window.GetData().isVisible) return;
        // We need to execute it directly so the open popup is the latest.
        this.manager.ClosingPopup(this);
        setTimeout(() => {
            this.window.GetData().isVisible = false;
            if (this.window.ClosingPopup)
                this.window.ClosingPopup();
        }, 200);
        this.window.GetData().isVisiblePopup = false;
       
    }

   
    

    /** Delete this subsciption. */
    public Dispose() {
        this.manager.Unsubscribe(this);
    }
}

class PopupLayerSubscription implements IPopupLayerSubscription {

    private manager: PopupManager;
    private doOpen: () => void | null;
    private doClose: () => void | null;
    public IsDeleted: boolean = false;
    public layerIndex: number;

    public constructor(manager: PopupManager, layerIndex: number, doOpen: () => void | null, doClose: () => void | null) {
        this.manager = manager;
        this.layerIndex = layerIndex;
        this.doOpen = doOpen;
        this.doClose = doClose;
    }

    public InternalOpening() {
        if (this.IsDeleted) return;
        this.doOpen();

    }
    public InternalClosing() {
        if (this.IsDeleted) return;
        this.doClose();
    }

    /** Delete this subsciption. */
    public Dispose() {
        this.manager.UnsubscribeLayer(this);
    }
}

