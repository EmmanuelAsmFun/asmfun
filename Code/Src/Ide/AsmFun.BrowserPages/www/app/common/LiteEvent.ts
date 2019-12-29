// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IDisposable } from "./System.js";

/** Lite eventhandler. */
export interface ILiteEvent<T> {
    add(handler: Function);
    addItems(...handler: Function[]);
    removeItems(...handler: Function[]);
    remove(handler: Function);
    trigger(data?: T);
    removeAll();
}

/** Lite eventhandler. */
export class LiteEvent<T> implements ILiteEvent<T>, IDisposable {

    private handlers: Function[];

    constructor() {
        this.handlers = new Array<Function>();
    }

    public add(handler: Function) {
        this.handlers.push(handler);
    }

    public addItems(...handler: Function[]) {
        handler.forEach(x => this.handlers.push(x));
    }

    public remove(handler: Function) {
        this.handlers = this.handlers.filter(h => h !== handler);
    }

    public removeItems(...handler: Function[]) {
        handler.forEach(x => this.remove(x));
    }

    public trigger(data?: T) {
        if (this.handlers) {
            this.handlers.forEach(h => h(data));
        }
    }

    public removeAll() { this.clear(); }

    public clear() {
        this.handlers.splice(0, this.handlers.length);
    }

    /** Releases all used refercnces subscribed in the events by clearing the list. */
    public Dispose() {
        this.clear();
    }
}


 
