// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

export interface Action0 {
    (): void;
}

export interface Action<T> {
    (item: T): void;
}

export interface Action2<T1, T2> {
    (item1: T1, item2: T2): void;
}

export interface Action3<T1, T2, T3> {
    (item1: T1, item2: T2, item3: T3): void;
}

export interface Func<TResult> {
    (): TResult;
}

export interface Func1<T, TResult> {
    (item: T): TResult;
}

export interface Func2<T1, T2, TResult> {
    (item1: T1, item2: T2): TResult;
}

export interface Func3<T1, T2, T3, TResult> {
    (item1: T1, item2: T2, item3: T3): TResult;
}

export interface IDisposable {
    Dispose();
}

export interface IDictionaryT<TValue> {
    add(key: string, value: TValue): void;
    remove(key: string): void;
    removeAt(index: number): void;
    containsKey(key: string): boolean;
    keys(): string[];
    values(): TValue[];
}

export interface IKeyValuePair<TKey, TValue> {
    Key: TKey;
    Value: TValue;
}

export interface IDictionary extends IDictionaryT<any> {
}

export class Dictionary<TValue> implements IDictionaryT<TValue> {
    _keys: string[] = [];
    _values: TValue[] = [];

    //constructor(init: <any>{ key: string; value: TValue; }[] = null) {
    constructor(init?: { key: string; value: TValue; }[]) {
        if (init == null) return;
        for (var x = 0; x < init.length; x++) {
            this[init[x].key] = init[x].value;
            this._keys.push(init[x].key);
            this._values.push(init[x].value);
        }
    }

    add(key: string, value: TValue) {
        this[key] = value;
        this._keys.push(key);
        this._values.push(value);
    }

    remove(key: string) {
        var index = this._keys.indexOf(key, 0);
        this._keys.splice(index, 1);
        this._values.splice(index, 1);

        delete this[key];
    }

    removeAt(index: number) {
        if (index <= 0) return;
        var key = this._keys[index];
        this.remove(key);
    }

    getItem(key: string): TValue | null{
        var index = this._keys.indexOf(key);
        if (index < 0) return null;
        return this._values[index];
    }

    getAt(index: number): TValue |null {
        if (index < 0) return null;
        return this._values[index];
    }

    public keys(): string[] {
        return this._keys;
    }

    values(): TValue[] {
        return this._values;
    }

    containsKey(key: string) {
        if (typeof this[key] === "undefined") {
            return false;
        }

        return true;
    }

    toLookup(): IDictionary {
        return this;
    }

    count(): number {
        return this._keys.length;
    }

    length(): number {
        return this._keys.length;
    }
}


    export class Guid {

        public static NewGuid(): string {
            return this._p8() + this._p8(true) + this._p8(true) + this._p8();
        }
        private static _p8(s?: boolean): string {
            var p = (Math.random().toString(16) + "000000000").substr(2, 8);
            return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
        }
        public static Empty = "00000000-0000-0000-0000-000000000000";
    }
    export class Tuple<TItem1, TItem2>{
        public Item1: TItem1;
        public Item2: TItem2;

        constructor(item1?: TItem1, item2?: TItem2) {
            this.Item1 = <any>item1;
            this.Item2 = <any>item2;
        }
    }
    export class Tuple3<TItem1, TItem2, TItem3> extends Tuple<TItem1, TItem2>{
        public Item3?: TItem3;
    }

