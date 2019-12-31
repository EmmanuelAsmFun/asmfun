#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using AsmFun.Common.ServiceLoc;

namespace AsmFun.Core.ServiceLoc
{


    public class EmServiceResolverFactory : IEmServiceResolverFactory
    {

        private readonly Dictionary<string, EmServiceResolverContainer> containers =
            new Dictionary<string, EmServiceResolverContainer>();




        public EmServiceResolverFactory()
        {
            var defaultEmServiceResolerContainer = new EmServiceResolverContainer(EmServiceResolverConst.CONTAINER_DEFAULT);
            containers.Add(EmServiceResolverConst.CONTAINER_DEFAULT, defaultEmServiceResolerContainer);
            containers.Add(EmServiceResolverConst.CONTAINER_UI, new EmServiceResolverContainer(EmServiceResolverConst.CONTAINER_UI));
        }

        #region Resolve
        [DebuggerStepThrough]
        public object Resolve(Type type, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            if (!containers[container].Contains(type))
                return null;
            var service = containers[container].Get(type);
            if (service != null)
                return service.ResolveObj();
            return null;
        }
        [DebuggerStepThrough]
        public object Resolve(Type type, object parameter, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            if (!containers[container].Contains(type))
                return null;
            var service = containers[container].Get(type);
            if (service != null)
                return service.ResolveObj(parameter);
            return null;
        }
        //[DebuggerStepThrough]
        public TService Resolve<TService>(string container = EmServiceResolverConst.CONTAINER_DEFAULT) where TService : class
        {
            var type = typeof(TService);
            if (!containers[container].Contains(type))
                return null;
            var service = containers[container].Get(type);
            if (service != null)
                return service.Resolve<TService>();
            return null;
        }
        [DebuggerStepThrough]
        public TService Resolve<TService>(object parameter, string container = EmServiceResolverConst.CONTAINER_DEFAULT) where TService : class
        {
            var type = typeof(TService);
            if (!containers[container].Contains(type))
                return null;
            var service = containers[container].Get(type);
            if (service != null)
                return service.Resolve<TService>(parameter);
            return null;
        }
        [DebuggerStepThrough]
        public IEnumerable<TService> ResolveAll<TService>(string container = EmServiceResolverConst.CONTAINER_DEFAULT) where TService : class
        {
            var found = containers[container].GetAll<TService>();
            return found;
        }
        [DebuggerStepThrough]
        public TService ResolveByName<TService>(string name, string container = EmServiceResolverConst.CONTAINER_DEFAULT) where TService : class
        {
            if (!containers[container].Contains(name))
                return null;
            var service = containers[container].Get<TService>(name);
            if (service != null)
                return service.Resolve();
            return null;
        }
        [DebuggerStepThrough]
        public TService ResolveByName<TService>(string name, object parameter, string container = EmServiceResolverConst.CONTAINER_DEFAULT) where TService : class
        {
            if (!containers[container].Contains(name))
                return null;
            var service = containers[container].Get<TService>(name);
            if (service != null)
                return service.Resolve(parameter);
            return null;
        }

        #endregion

        #region Add
        public IEmServiceSubscription<TService> Add<TService, TClassService>()
          where TClassService : TService
        {
            string container = EmServiceResolverConst.CONTAINER_DEFAULT;
            var name = typeof(TService);
            containers[container].Exists(name);
            return CreateSubscription<TService>(containers[container],() => CreateInstance<TClassService>());
        }
        public IEmServiceSubscription<TService> Add<TService, TClassService>(string name, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
            where TClassService : TService
        {
            containers[container].Exists(name);
            return CreateSubscription<TService>(containers[container], () => CreateInstance<TClassService>(), name);
        }

        public IEmServiceSubscription<TService> Add<TService>(string name, TService service, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            containers[container].Exists(name);
            return CreateSubscription(containers[container],() => CreateInstance<TService>(), name);
        }

        public IEmServiceSubscription<TService> Add<TService>(string name, Func<TService> constructor, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            containers[container].Exists(name);
            return CreateSubscription(containers[container], constructor, name);
        }



        public IEmServiceSubscription Add<TService>(string name, Func<TService> constructor, TService service, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
            where TService : new()
        {
            containers[container].Exists(name);
            return CreateSubscription(containers[container], constructor, name);
        }
        public IEmServiceSubscription Add<TService>(Type interfaceType, TService service, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            containers[container].Exists(interfaceType);
            return CreateSubscription(interfaceType, containers[container], () => service);
        }

        public IEmServiceSubscription Add(Type interfaceType, Func<object> constructor, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            containers[container].Exists(container);
            return CreateSubscription(interfaceType, containers[container], constructor);
        }

        public IEmServiceSubscription<TService> Add<TService, TClassService>(string container = EmServiceResolverConst.CONTAINER_DEFAULT)
           where TClassService : TService
        {
            containers[container].Exists(typeof(TService));
            return CreateSubscription<TService>(containers[container],() => CreateInstance<TClassService>());
        }
        public IEmServiceSubscription<TService> Add<TService>(TService service, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            containers[container].Exists(typeof(TService));
            return CreateSubscription(containers[container], () => service);
        }

        public IEmServiceSubscription<TService> Add<TService>(TService service, Func<TService> constructor, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            containers[container].Exists(typeof(TService));
            return CreateSubscription(containers[container], constructor);
        }

        public IEmServiceSubscription<TService> Add<TService>(string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            containers[container].Exists(typeof(TService));
            var sub = CreateSubscription<TService>(containers[container],null);
            sub.WithConstructor(CreateInstance<TService>);
            return sub;
        }

        public IEmServiceSubscription<TService> Add<TService>(Func<TService> constructor, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            containers[container].Exists(typeof(TService));
            return CreateSubscription(containers[container], constructor);
        }
        public IEmServiceSubscription<TService> AddOrReplace<TService>(Func<TService> constructor, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            var cont = containers[container];
            if (cont.Contains(typeof(TService)))
                cont.Remove(typeof(TService));
            return CreateSubscription(cont, constructor);
        }

        public IEmServiceSubscription<TService> Add<TService>(Func<TService> constructor, TService service, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
            where TService : new()
        {
            containers[container].Exists(typeof(TService));
            CreateSubscription(containers[container], constructor);
            return null;
        }
        private TClassService CreateInstance<TClassService>()
        {
            TClassService svc = default(TClassService);
            var ctrs = typeof(TClassService).GetConstructors();

            var aparamsList = new List<object>();
            var constr = ctrs.First();
            var paramts = constr.GetParameters();
            foreach (var para in paramts)
            {
                var svcChild = Resolve(para.ParameterType);
                aparamsList.Add(svcChild);
            }
            if (aparamsList.Count == 0)
                svc = (TClassService)Activator.CreateInstance(typeof(TClassService));
            else
                svc = (TClassService)constr.Invoke(aparamsList.ToArray());

            return svc;
        }
        #endregion



        public bool Contains<T>(string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            return containers[container].Contains(typeof(T));
        }
        public bool Contains(Type type, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            return containers[container].Contains(type);
        }

        public IEmServiceSubscription<TService> Update<TService>(TService service, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            var containerr = containers[container];
            var type = typeof(TService);
            if (!containerr.Contains(type))
            {
                return CreateSubscription(containerr, () => service);
            }
            var subscription = containerr.Get<TService>(type);
            subscription.SetInstance(service);
            return subscription;
        }

        public IEmServiceSubscription<TService> Update<TService>(string name, TService service,
            string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            var containerr = containers[container];
            if (!containerr.Contains(name))
            {
                return CreateSubscription(containerr, () => service, name);
            }
            var subscription = containerr.Get<TService>(name);
            subscription.SetInstance(service);
            return subscription;
        }

        public IEmServiceResolver Delete(Type type, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            var containerr = containers[container];
            if (!containerr.Contains(type))
                return this;
            containerr.Remove(type);
            return this;
        }

        public IEmServiceResolver Delete(string name, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            var containerr = containers[container];
            if (!containerr.Contains(name))
                return this;
            containerr.Remove(name);
            return this;
        }

        public IEmServiceResolver Delete<TService>(string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            var type = typeof(TService);
            var containerr = containers[container];
            if (!containerr.Contains(type))
                return this;
            containerr.Remove(type);
            return this;
        }
        public IEmServiceResolver GetForContainer(string container)
        {
            return new EmServiceResolver(container, this);
        }


        private IEmServiceSubscription<TService> CreateSubscription<TService>(
            EmServiceResolverContainer EmServiceResolerContainer, Func<TService> constructor, string name = null)
        {
            var type = typeof(TService);
            var subscription = new ServiceSubscription<TService>
            {
                Type = type,
                Constructor = constructor,
                Lifestyle = EmServiceLifestyle.Singleton,
                Name = name ?? type.Name,
            };
            if (name != null)
                EmServiceResolerContainer.Add(name, subscription);
            else
                EmServiceResolerContainer.Add(type, subscription);
            return subscription;
        }
        private IEmServiceSubscription CreateSubscription<TService>(Type interfaceService,
           EmServiceResolverContainer EmServiceResolerContainer, Func<TService> constructor, string name = null)
        {
            var subscription = new ServiceSubscription<TService>
            {
                Type = interfaceService,
                Constructor = constructor,
                Lifestyle = EmServiceLifestyle.Singleton,
                Name = name ?? interfaceService.Name,
            };
            if (name != null)
                EmServiceResolerContainer.Add(name, subscription);
            else
                EmServiceResolerContainer.Add(interfaceService, subscription);
            return subscription;
        }

        public void Dispose()
        {
            foreach (var container in containers.Values)
                container.Dispose();
        }

    }


}