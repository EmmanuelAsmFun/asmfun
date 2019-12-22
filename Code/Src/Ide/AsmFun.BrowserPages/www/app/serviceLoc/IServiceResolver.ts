// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import {  Func, Func1, IDisposable } from '../common/System.js'
import { ServiceName, ServiceLifestyle } from './ServiceName.js'

export interface IServiceSubscription {
    GetName(): ServiceName | null;
    GetType(): string;
    GetInstance<TService>(): TService | null;
}

export interface IServiceSubscription {
    Name: ServiceName | null;
    Type: string | null;
    Lifestyle: ServiceLifestyle | null;
    Dispose();
    Resolve<TService>(constructorData?: Object): TService | null;
}

export interface IServiceSubscriptionT<TService> extends IServiceSubscription {
    WithConstructor(constructor1: Func<TService>): IServiceSubscriptionT<TService> | null;
    WithLifestyle(lifeStyle: ServiceLifestyle): IServiceSubscriptionT<TService> | null;
}


export interface IServiceResolver {

    Resolve<TService>(serviceName: ServiceName, container?: string, constructorData?: Object): TService | null;
    ResolveByName<TService>(serviceName: ServiceName, name: string, container?: string, constructorData?: Object): TService | null;
}

    export interface IServiceResolverFactory extends IServiceResolver, IDisposable {

        AddInstance<TService>(serviceName: ServiceName, service: TService, container?: string): IServiceSubscriptionT<TService> | null;
        Add<TService>(serviceName: ServiceName, type: { new(): TService }, container?: string): IServiceSubscriptionT<TService> | null;
        AddWithConstructor<TService>(serviceName: ServiceName, constructor1: Func1<Object, TService>, container?: string): IServiceSubscriptionT<TService> | null;
        UpdateWithConstructor<TService>(serviceName: ServiceName, constructor1: Func1<Object, TService>, container?: string): IServiceSubscriptionT<TService> | null;

    /*IServiceSubscription < TService > Add<TService>(name:string, TService service, Func < TService > constructor,
        string container = ServiceResolverFactory.CONTAINER_DEFAULT);

    IServiceSubscription Add<TService>(Type interfaceType, TService service,
        string container = ServiceResolverFactory.CONTAINER_DEFAULT);

    IServiceSubscription < TService > Add<TService>(TService service,
        string container = ServiceResolverFactory.CONTAINER_DEFAULT);

    IServiceSubscription < TService > Add<TService>(TService service, Func < TService > constructor,
        string container = ServiceResolverFactory.CONTAINER_DEFAULT);

    IServiceSubscription < TService > Add<TService>(string container = ServiceResolverFactory.CONTAINER_DEFAULT);

    IServiceSubscription < TService > Add<TService>(Func < TService > constructor,
        string container = ServiceResolverFactory.CONTAINER_DEFAULT);

    IServiceResolver Remove(name:string, string container = ServiceResolverFactory.CONTAINER_DEFAULT);
    IServiceResolver Remove<TService>(string container = ServiceResolverFactory.CONTAINER_DEFAULT);

     
    IServiceSubscription < TService > Update<TService>(name:string, TService settings,
        string container = ServiceResolverFactory.CONTAINER_DEFAULT);

    IServiceResolver GetForContainer(string container);*/
        AddContainer(name: string);
    }


 
