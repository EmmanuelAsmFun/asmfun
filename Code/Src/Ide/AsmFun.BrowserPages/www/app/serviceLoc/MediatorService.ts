// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { BaseService } from './BaseService.js'
import { Action2 } from '../common/System.js'
import { IMediatorService } from './IMediatorService.js'
import { IMediatorEvent, IMediatorSubscription } from './IMediator.js'
import { Mediator } from './Mediator.js'
import { ServiceName, IMediatorServiceName } from './ServiceName.js'


/** Class to subscribe to event types. It's used to communicate between multiple viewModels. */
export class MediatorService extends BaseService implements IMediatorService{

    /** If the mediator is created by me, we have to dispose it too. */
    private _mediatorCreatedByMe: boolean = false;
    /** The mediator instance. */
    private _mediator: Mediator;

    constructor(mediator?: Mediator) {
        super();
        this._mediator = mediator;
        if (this._mediator == null) {
            this._mediator = new Mediator();
            this._mediatorCreatedByMe = true;
        }
    }

    /** Subscribes an actionName to a function to execute when the ActionName is Invoked . */
    public Subscribe(actionName: string, action: Action2<any, IMediatorEvent>): IMediatorSubscription {
        return this._mediator.Subscribe(actionName,action);
    }

    /** Unsubscribes an actionName. */
    public Unsubscribe(subscription: IMediatorSubscription) {
        this._mediator.Unsubscribe(subscription);
    }

    /** Fire an event by ActionName. */
    public InvokeEvent(actionName: string, data: any) {
        this._mediator.InvokeEvent(actionName,data);
    }

    /** (override) Gets the name of this service. */
    protected OnGetName(): ServiceName {
        return IMediatorServiceName;
    }

    /** (override) Disposes this service. */
    protected OnDispose() {
        if (this._mediatorCreatedByMe)
            this._mediator.Dispose();
    }
}

 
