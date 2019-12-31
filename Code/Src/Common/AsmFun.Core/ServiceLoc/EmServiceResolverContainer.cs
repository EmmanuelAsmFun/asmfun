#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;

namespace AsmFun.Core.ServiceLoc
{


    [DebuggerDisplay(
        "Container:{Name}:subscriptions={subscriptions.Count}:subscriptionsByType={subscriptionsByType.Count}")]
    internal class EmServiceResolverContainer
    {
        public string Name { get; private set; }
        private readonly Dictionary<string, IServiceSubscription> subscriptions;
        private readonly Dictionary<Type, IServiceSubscription> subscriptionsByType;

        public EmServiceResolverContainer(string name)
        {
            Name = name;
            subscriptions = new Dictionary<string, IServiceSubscription>();
            subscriptionsByType = new Dictionary<Type, IServiceSubscription>();
        }
        [DebuggerStepThrough]
        public ServiceSubscription<TService> Get<TService>(string name)
        {
            var sub = subscriptions[name];
            return sub as ServiceSubscription<TService>;
        }
        [DebuggerStepThrough]
        public IServiceSubscription Get(Type type)
        {
            return subscriptionsByType[type];
        }
        [DebuggerStepThrough]
        public ServiceSubscription<TService> Get<TService>(Type type)
        {
            return subscriptionsByType[type] as ServiceSubscription<TService>;
        }

        public IEnumerable<TService> GetAll<TService>() where TService : class
        {
            var found = subscriptionsByType
                .Where(s => s.Key is TService)
                .Select(s => ((ServiceSubscription<TService>)s.Value).Instance);
            return found;
        }



        public void Add(string name, IServiceSubscription subscription)
        {
            subscriptions.Add(name, subscription);
        }

        public void Add(Type type, IServiceSubscription subscription)
        {
            subscriptionsByType.Add(type, subscription);
        }

        public void Remove(string name)
        {
            var service = subscriptions[name];
            Dispose(service);
            subscriptions.Remove(name);
        }

        public void Remove(Type type)
        {
            var service = subscriptionsByType[type];
            Dispose(service);
            subscriptionsByType.Remove(type);
        }

            public void Exists(string name)
        {
            if (subscriptions.ContainsKey(name))
                throw new Exception(string.Format("Service with name {0} has already been registered", name));
        }

        public void Exists(Type type)
        {
            if (subscriptionsByType.ContainsKey(type))
                throw new Exception(string.Format("Service with name {0} has already been registered", type.Name));
        }


        public void Dispose()
        {
            foreach (var registration in subscriptions.Values)
                Dispose(registration);
            foreach (var registration in subscriptionsByType.Values)
                Dispose(registration);
        }

        private void Dispose(object registration)
        {
            var disposable = registration as IDisposable;
            if (disposable != null)
                disposable.Dispose();
        }

        public bool Contains(string name)
        {
            return subscriptions.ContainsKey(name);
        }
        [DebuggerStepThrough]
        public bool Contains(Type type)
        {
            return subscriptionsByType.ContainsKey(type);
        }

        public string WriteAllServices()
        {
            var sb = new StringBuilder();
            foreach (var serviceSubscription in subscriptions)
                sb.AppendLine(serviceSubscription.Key);
            sb.AppendLine();
            foreach (var serviceSubscription in subscriptionsByType)
                sb.AppendLine(serviceSubscription.Key.Name);
            return sb.ToString();
        }

       
    }
}
