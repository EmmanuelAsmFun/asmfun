// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { Func, Func1, IDisposable, Dictionary } from '../../common/System.js'
import { ServiceName, ServiceLifestyle, CONTAINER_DEFAULT } from './ServiceName.js'
import { IServiceSubscriptionT, IServiceResolverFactory, IServiceSubscription, IServiceResolver } from './IServiceResolver.js'
   
export class ServiceResolverFactory implements IServiceResolverFactory {
   
    /** List with all the services. */
    private containers = new Dictionary<ServiceResolverContainer>();

    constructor() {
        this.containers.add(CONTAINER_DEFAULT, new ServiceResolverContainer(CONTAINER_DEFAULT));
    }
    public AddContainer(name: string) {
        this.containers.add(name, new ServiceResolverContainer(name));
    }
    public AddInstance<TService>(serviceName: ServiceName, service: TService, container?: string): IServiceSubscriptionT<TService> {
        return this.AddInstance2(serviceName, <any>service, container)
    }
    public AddInstance2<TService>(serviceName: ServiceName, type: { new(): TService }, container: string = CONTAINER_DEFAULT)
        : IServiceSubscriptionT<TService> {
        this.containers[container].ExistsByType(ServiceName);
        return this.CreateSubscription<TService>(serviceName,this.containers[container], () => new type());
    }

    Add<TService>(serviceName: ServiceName, type: new () => TService, container?: string): IServiceSubscriptionT<TService> {
        return <any>this.Add2(serviceName, type, container);
    }

    public Add2<TService>(serviceName: ServiceName, service: TService, container: string = CONTAINER_DEFAULT): IServiceSubscriptionT<TService> {
        this.containers[container].ExistsByType(ServiceName);
        return this.CreateSubscription<TService>(serviceName,this.containers[container], () => service);
    }

    public AddWithConstructor<TService>(serviceName: ServiceName, constructor1: Func1<Object,TService>, container: string = CONTAINER_DEFAULT): IServiceSubscriptionT<TService> {
        this.containers[container].ExistsByType(ServiceName);
        return this.CreateSubscription<TService>(serviceName,this.containers[container], constructor1);
    }

    public UpdateWithConstructor<TService>(serviceName: ServiceName, constructor1: Func1<Object,TService>, container: string = CONTAINER_DEFAULT): IServiceSubscriptionT<TService> {
        this.containers[container].ExistsByType(ServiceName);
        var subscription = <ServiceSubscription<TService>>this.containers[container].GetByTypeT(serviceName);
        if (subscription == null) throw "Subscription not found inserviceResolver (" + container + ":" + ServiceName + ")";
        subscription.Constructor = constructor1;
        return <any>subscription;
    }

    public Resolve<TService>(serviceName: ServiceName, container: string = CONTAINER_DEFAULT, constructorData?: Object): TService | null {
        const cont = this.containers[container];
        if (!cont.ContainsType(serviceName)) return null;
            
        var subscription = <ServiceSubscription<TService>>cont.GetByTypeT(serviceName);
        if (subscription != null)
            return subscription.Resolve(constructorData);
        return null;
    }

    public ResolveByName<TService>(serviceName: ServiceName, name: string, container: string = CONTAINER_DEFAULT, constructorData?: Object): TService | null{
        const cont = this.containers[container];
        if (!cont.ContainsName(name)) return null;
        var subscription = <ServiceSubscription<TService>>cont.GetByName(name);
        if (subscription != null)
            return subscription.Resolve(constructorData);
        return null;
    }
        
    private CreateSubscription<TService>(serviceName: ServiceName,
        serviceResolerContainer: ServiceResolverContainer, constructor1: Func1<Object, TService>, name: string | null = null): IServiceSubscriptionT<TService> {
        var type1 = constructor1.toString();
        var subscription = new ServiceSubscription<TService>();
        subscription.Type = type1;
        subscription.Constructor = constructor1;
        subscription.Lifestyle = ServiceLifestyle.Singleton;
        subscription.Name = serviceName;
        if (name != null)
            serviceResolerContainer.AddByName(name, <IServiceSubscription>subscription);
        else
            serviceResolerContainer.AddByType(serviceName, <IServiceSubscription>subscription);
        return <IServiceSubscriptionT<TService>>subscription;
    }

    private CreateSubscriptionByName<TService>(interfaceService: ServiceName,
        serviceResolerContainer: ServiceResolverContainer, constructor1: Func1<Object, TService>, name: string | null = null): IServiceSubscription {
        var subscription = new ServiceSubscription<TService>();
        subscription.Type = interfaceService.Name;
        subscription.Constructor = constructor1;
        subscription.Lifestyle = ServiceLifestyle.Singleton;
        subscription.Name = interfaceService;
        if (name != null)
            serviceResolerContainer.AddByName(name, <IServiceSubscription>subscription);
        else
            serviceResolerContainer.AddByType(interfaceService, <IServiceSubscription>subscription);
        return <IServiceSubscription>subscription;
    }

    private GetSubscription<TService>(interfaceService: ServiceName, serviceResolerContainer: ServiceResolverContainer): ServiceSubscription<TService> {
        return serviceResolerContainer.GetByName<TService>(name);
    }

    public Dispose() {
            
    }
}

    

export class ServiceSubscription<TService> implements IServiceSubscription, IServiceSubscriptionT<TService> {
   
  

    private instance: TService | null = null;

    public Name: ServiceName | null = null;
    public GetName(): ServiceName { return this.Name ?? { Name: "" }; }
    public Type: string | null = null;
    public GetType(): string { return this.Type ?? ""; }
    public Constructor: Func1<Object, TService> | null = null;
    public Lifestyle: ServiceLifestyle | null = null;

    public Dispose() {
        if (this.instance != null && (<IDisposable><any>this.instance).Dispose != null)
        (<IDisposable><any>this.instance).Dispose();
    }

    public SetInstance(service: TService) {
        if (this.instance != null)
            this.Dispose();
        this.instance = service;
    }
   

    public Resolve<TService>(constructorData?: Object): TService | null {
        if (this.Constructor == null)
            throw ("Constructor method has not been set in the service resolver for " + this.Type + ":" + this.Name + ". Add the method WithConstructor(()=> new Object()) when defining the interface.");
        if (this.Lifestyle === ServiceLifestyle.Transient)
            return <any>this.Constructor(<any>constructorData);
        if (this.instance == null)
            this.instance = this.Constructor(<any>constructorData);
        return <any>this.instance;
    }

    public WithConstructor(constructor1: Func<TService>): IServiceSubscriptionT<TService> | null{
        this.Constructor = constructor1;
        return <any>this;
    }

    public WithLifestyle(lifeStyle: ServiceLifestyle): IServiceSubscriptionT<TService> | null{
        this.Lifestyle = lifeStyle;
        return <any>this;
    }
    public GetInstance<TService>(): TService {
        return <any>this.instance;
    }
    public GetInstance2(): TService | null{
        return this.instance;
    }

    public GetInstanceT<TService1>(): TService1 | null{
        return <TService1><any>this.instance;
    }
}

export class ServiceResolverContainer {
    public Name: string;
    private subscriptions: Dictionary<IServiceSubscription> = new Dictionary<IServiceSubscription>();
    private subscriptionsByType: Dictionary<IServiceSubscription> = new Dictionary<IServiceSubscription>();

    constructor(name: string) {
        this.Name = name;
    }

    public GetByName<TService>(name: string): ServiceSubscription<TService> {
        return <ServiceSubscription<TService>>this.subscriptions[name];
    }

    public GetByType(type1: ServiceName): IServiceSubscription {
        return this.subscriptionsByType[type1.Name];
    }

    public GetByTypeT<TService>(type1: ServiceName): ServiceSubscription<TService> {
        return <ServiceSubscription<TService>>this.subscriptionsByType[type1.Name];
    }


    public AddByName(name: string, subscription: IServiceSubscription) {
        this.subscriptions.add(name, subscription);
    }

    public AddByType(type1: ServiceName, subscription: IServiceSubscription) {
        this.subscriptionsByType.add(type1.Name, subscription);
    }

    public RemoveByName(name: string) {
        var service = this.subscriptions[name];
        this.DisposeByRegistration(service);
        this.subscriptions.remove(name);
    }

    public RemoveByType(type1: ServiceName) {
        var service = this.subscriptionsByType[type1.Name];
        this.DisposeByRegistration(service);
        this.subscriptionsByType.remove(type1.Name);
    }

    public ExistsByName(name: string) {
        if (this.subscriptions.containsKey(name))
            throw "Service with name " + name + " has already been registered";
    }

    public ExistsByType(type1: ServiceName) {
        if (this.subscriptionsByType.containsKey(type1.Name))
            throw "Service with name " + type1 + " has already been registered";
    }


    public Dispose() {
        for (var i = 0; i < this.subscriptions.values().length; i++) {
            this.DisposeByRegistration(this.subscriptions.values()[i]);
        }
        for (var i = 0; i < this.subscriptionsByType.values().length; i++) {
            this.DisposeByRegistration(this.subscriptionsByType.values()[i]);
        }
    }

    private DisposeByRegistration(registration: Object) {
        if ((<any>registration).Dispose != null) {
            (<IDisposable>registration).Dispose();
        }

    }

    public ContainsByName(name: string): boolean {
        return this.subscriptions.containsKey(name);
    }

    public ContainsType(type1: ServiceName): boolean {
        return this.subscriptionsByType.containsKey(type1.Name);
    }

}

export class ServiceResolver implements IServiceResolver
{
    private containerName:string;
    private parentResolver: IServiceResolverFactory;

    constructor(containerName: string, parent: IServiceResolverFactory)
    {
        this.containerName = containerName;
        this.parentResolver = parent;
    }
     
    public Resolve<TService>(serviceName: ServiceName, container: string | null = null): TService | null
    {
        return this.parentResolver.Resolve<TService>(serviceName, this.containerName);
    }
       
    public ResolveByName<TService>(serviceName: ServiceName, name: string, container: string | null = null): TService | null
    {
        return this.parentResolver.ResolveByName<TService>(serviceName,this.containerName);
    }

}

