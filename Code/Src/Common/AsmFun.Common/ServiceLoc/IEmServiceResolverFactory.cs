#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;

namespace AsmFun.Common.ServiceLoc
{
    public interface IEmServiceResolverFactory : IEmServiceResolver, IDisposable
    {
        IEmServiceSubscription<TService> Add<TService, TClassService>()
          where TClassService : TService;
        IEmServiceSubscription<TService> Add<TService>(string name, TService service,
            string container = EmServiceResolverConst.CONTAINER_DEFAULT);

        IEmServiceSubscription<TService> Add<TService>(string name, Func<TService> constructor,
            string container = EmServiceResolverConst.CONTAINER_DEFAULT);

        IEmServiceSubscription Add(Type interfaceType, Func<object> constructor,
            string container = EmServiceResolverConst.CONTAINER_DEFAULT);

        IEmServiceSubscription Add<TService>(Type interfaceType, TService service,
           string container = EmServiceResolverConst.CONTAINER_DEFAULT);

        IEmServiceSubscription<TService> Add<TService>(TService service,
            string container = EmServiceResolverConst.CONTAINER_DEFAULT);

        IEmServiceSubscription<TService> Add<TService>(TService service, Func<TService> constructor,
            string container = EmServiceResolverConst.CONTAINER_DEFAULT);

        IEmServiceSubscription<TService> Add<TService>(string container = EmServiceResolverConst.CONTAINER_DEFAULT);

        IEmServiceSubscription<TService> Add<TService>(Func<TService> constructor,
            string container = EmServiceResolverConst.CONTAINER_DEFAULT);
        /// <summary>
        /// Will auto dispose the service
        /// </summary>
        IEmServiceResolver Delete(Type type, string container = EmServiceResolverConst.CONTAINER_DEFAULT);
        /// <summary>
        /// Will auto dispose the service
        /// </summary>
        IEmServiceResolver Delete(string name, string container = EmServiceResolverConst.CONTAINER_DEFAULT);
        /// <summary>
        /// Will auto dispose the service
        /// </summary>
        IEmServiceResolver Delete<TService>(string container = EmServiceResolverConst.CONTAINER_DEFAULT);

        IEmServiceSubscription<TService> Update<TService>(TService settings,
            string container = EmServiceResolverConst.CONTAINER_DEFAULT);

        IEmServiceSubscription<TService> Update<TService>(string name, TService settings,
            string container = EmServiceResolverConst.CONTAINER_DEFAULT);

        IEmServiceResolver GetForContainer(string container);
    }


}
