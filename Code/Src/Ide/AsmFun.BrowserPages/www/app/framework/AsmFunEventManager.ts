// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { Action2, Dictionary } from '../common/System.js'
import { IAsmFunEventEvent, IAsmFunEventSubscription, IEventManager } from './IAsmFunEventManager.js'
import { IAsmFunBaseEvent,  IAsmFunEventType } from '../data/EventsCommon.js';
import { ServiceName } from '../serviceLoc/ServiceName.js';

/** Meditor item used internaly only. */
class EventItem {
    public nameSpace: string = "";
    public eventName: string = "";
    public Subscriptions: AsmFunEventSubscription[] = new Array<AsmFunEventSubscription>();
}

/** Event event is propagated when an event is fired to be able to stop the propagation. */
class MEventEvent implements IAsmFunEventEvent {
    public ContinuePropagation: boolean = false;
    constructor() { }
}

/** Class to subscribe to event types. It's used to communicate between multiple viewModels. */
export class AsmFunEventManager implements IEventManager {

    private _items: Dictionary<EventItem> = new Dictionary<EventItem>();

    /** Subscribes to a event. Pass an empty event as the first parameter with the namespace and eventname filled. */
    public Subscribe2<T extends IAsmFunBaseEvent>(event: T, callerObj: object, action: Action2<T, IAsmFunEventEvent>): IAsmFunEventSubscription {
        var type = event.GetType();
        var subscription = this.SubscribeByName(type.nameSpace, type.eventName, callerObj, action);
        return subscription;
    }
    public Subscribe2At<T extends IAsmFunBaseEvent>(index: number, event: T, callerObj: object, action: Action2<T, IAsmFunEventEvent>): IAsmFunEventSubscription {
        var type = event.GetType();
        var subscription = this.SubscribeByNameAt(index, type.nameSpace, type.eventName, callerObj, action);
        return subscription;
    }

    /** Subscribes to a event. Pass an empty event as the first parameter with the namespace and eventname filled. */
    public Subscribe<T extends IAsmFunBaseEvent>(eventType: IAsmFunEventType, callerObj: object, action: Action2<T, IAsmFunEventEvent>): IAsmFunEventSubscription {
        var subscription = this.SubscribeByName(eventType.nameSpace, eventType.eventName, callerObj, action);
        return subscription;
    }
    public SubscribeAt<T extends IAsmFunBaseEvent>(index: number, eventType: IAsmFunEventType, callerObj: object, action: Action2<T, IAsmFunEventEvent>): IAsmFunEventSubscription {
        var subscription = this.SubscribeByNameAt(index, eventType.nameSpace, eventType.eventName, callerObj, action);
        return subscription;
    }
    /** Subscribes to a event. */
    public SubscribeByName<T extends IAsmFunBaseEvent>(nameSpace: string, eventName: string, callerObj: object, action: Action2<T, IAsmFunEventEvent>): IAsmFunEventSubscription {
        return this.SubscribeByNameAt(-1, nameSpace, eventName, callerObj, action);
    }
    public SubscribeByNameAt<T extends IAsmFunBaseEvent>(index: number, nameSpace: string, eventName: string, callerObj: object, action: Action2<T, IAsmFunEventEvent>): IAsmFunEventSubscription {
        var subscription = new AsmFunEventSubscription(this, action, nameSpace, eventName, callerObj);
        var fullName = subscription.getFullName();
        if (this._items.containsKey(fullName)) {
            var item = this._items.getItem(fullName);
            if (item != null) {
                if (index > -1 && index < item.Subscriptions.length)
                    item.Subscriptions.splice(index, 0, subscription);
                else
                    item.Subscriptions.push(subscription);
            }
        } else {
            var itemNew = new EventItem();
            itemNew.Subscriptions.push(subscription);
            this._items.add(fullName, itemNew);
        }
        return subscription;
    }

    /** Unsubscribes to a event type . */
    public Unsubscribe(subscription: IAsmFunEventSubscription) {
        var fullName = subscription.getFullName();
        if (!this._items.containsKey(fullName)) return;
        var item = this._items.getItem(fullName);
        if (item == null) return;
        var index = item.Subscriptions.indexOf(<AsmFunEventSubscription>subscription);
        if (index < 0) return;
        item.Subscriptions.splice(index, 1);
        if (item.Subscriptions.length === 0)
            this._items.remove(fullName);
        subscription.IsDeleted = true;
    }


    /** Fire a event. */
    public InvokeEvent(event: IAsmFunBaseEvent) {
        var fullName = event.getFullName();
        if (!this._items.containsKey(fullName)) return;
        var item = this._items.getItem(fullName);
        if (item == null) throw "event not found";
        var EventEvent = new MEventEvent();
        EventEvent.ContinuePropagation = true;
        console.info("Invoke Event: " + fullName);
        for (var i = 0; i < item.Subscriptions.length; i++) {
            var subscription = item.Subscriptions[i];
            subscription.Invoke(event, EventEvent);
            if (!EventEvent.ContinuePropagation) break;
        }
    }

    /** Disposes this instance with all the subscriptions. */
    public Dispose() {
        this._items._values.forEach(x => {
            x.Subscriptions.forEach(s => {
                s.Dispose();
            });
        });
    }
    public static ServiceName: ServiceName = new ServiceName("EventManager");
}


/** A subscription to the Event. */
class AsmFunEventSubscription implements IAsmFunEventSubscription {
    /** The action to execute. */
    private Action: any; // Action2<IBaseEvent, IEventEvent>;
    /** The nameSpace. */
    public nameSpace: string;
    /** The name of the event */
    public eventName: string;
    /** If this subscription is deleted. */
    public IsDeleted: boolean = false;
    /** The meditator object. */
    private _eventObj: AsmFunEventManager;
    private callerObj: any;

    constructor(Event: AsmFunEventManager, action, nameSpace: string, eventName: string, callerObj: object) {
        this._eventObj = Event;
        this.Action = action;
        this.nameSpace = nameSpace;
        this.eventName = eventName;
        this.callerObj = callerObj;
    }
    public Invoke(event: IAsmFunBaseEvent, evt: IAsmFunEventEvent) {
        this.Action.apply(this.callerObj, [event, evt]);
        // this.callerObj.call[this.Action(event,evt)];
    }
    public getFullName() {
        return this.nameSpace + "." + this.eventName;
    }

    /** Delete this subsciption. */
    public Dispose() {
        this._eventObj.Unsubscribe(this);
    }
}




