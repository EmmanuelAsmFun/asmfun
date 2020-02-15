// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

/** Class to store the serviceName. 
        We need to use a serviceName because in javascript there are no interfaces. That's why we need to resolve a service by a string. 
        So this class stores an interface serviceName. We can then create other services with the same interface.
    */

export class ServiceName {
    public Name: string;

    constructor(serviceName: string) { this.Name = serviceName; }
}

export const enum ServiceLifestyle {
    Unknown,
    Singleton,
    Transient
}

export var CONTAINER_DEFAULT = "Default";
export var CONTAINER_UI = "UI";
export var IAlertMessagesName = new ServiceName("IAlertMessages");
export var IMediatorServiceName = new ServiceName("IMediatorService");

