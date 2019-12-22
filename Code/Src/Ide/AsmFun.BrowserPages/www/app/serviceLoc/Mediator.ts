// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { Action2, Dictionary } from '../common/System.js'
import { IMediatorEvent, IMediatorSubscription } from './IMediator.js'

/** Class to subscribe to event types. It's used to communicate between multiple viewModels. */
export class Mediator  {

    private _items: Dictionary<MediatorItem> = new Dictionary<MediatorItem>();

    /** Subscribes an actionName to a function to execute when the ActionName is Invoked . */
    public Subscribe(actionName: string, action: Action2<any, MediatorEvent>): IMediatorSubscription {
        var subscription = new MediatorSubscription(this);
        subscription.Action = action;
        subscription.ActionName = actionName;
        if (this._items.containsKey(actionName)) {
            var item = this._items.getItem(actionName);
            item.Subscriptions.push(subscription);
        } else {
            var itemNew = new MediatorItem();
            itemNew.Subscriptions.push(subscription);
            this._items.add(actionName, itemNew);
        }
        return subscription;
    }

    /** Unsubscribes an actionName. */
    public Unsubscribe(subscription: IMediatorSubscription) {
        if (!this._items.containsKey(subscription.ActionName)) return;
        var item = this._items.getItem(subscription.ActionName);
        var index = item.Subscriptions.indexOf(<MediatorSubscription>subscription);
        if (index < 0) return;
        item.Subscriptions.splice(index, 1);
        if (item.Subscriptions.length === 0)
            this._items.remove(subscription.ActionName);
        subscription.IsDeleted = true;
    }

    /** Fire an event by ActionName. */
    public InvokeEvent(actionName: string, data: any) {
        if (!this._items.containsKey(actionName)) return;
        var item = this._items.getItem(actionName);
        var mediatorEvent = new MediatorEvent();
        mediatorEvent.ContinuePropagation = true;
        for (var i = 0; i < item.Subscriptions.length; i++) {
            var subscription = item.Subscriptions[i];
            subscription.Action(data, mediatorEvent);
            if (!mediatorEvent.ContinuePropagation) break;
        }
    }

    /** Disposes this instance with all the subscriptions. */
    public Dispose() {
        this._items._values.forEach(x => {
            x.Subscriptions.forEach(s => {
                s.Delete();
            });
        });
    }
}


/** Meditor item used internaly only. */
class MediatorItem {
    public ActionName: string;
    public Subscriptions: MediatorSubscription[] = new Array<MediatorSubscription>();
}

/** Mediator event is propagated when an event is fired to be able to stop the propagation. */
export class MediatorEvent implements IMediatorEvent{
    public ContinuePropagation: boolean = false;
}

/** A subscription to the mediator. */
export class MediatorSubscription implements IMediatorSubscription{
    /** The action to execute. */
    public Action: Action2<any, MediatorEvent>;
    /** The actionName. */
    public ActionName: string;
    /** If this subscription is deleted. */
    public IsDeleted: boolean = false;
    /** The meditator object. */
    private _mediatorObj: Mediator;

    constructor(mediator: Mediator) {
        this._mediatorObj = mediator;
    }

    /** Delete this subsciption. */
    public Delete() {
        this._mediatorObj.Unsubscribe(this);
    }
}



