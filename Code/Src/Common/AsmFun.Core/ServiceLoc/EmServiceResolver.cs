#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using System;
using System.Collections.Generic;

namespace AsmFun.Core.ServiceLoc
{

    internal class EmServiceResolver : IEmServiceResolver
    {
        private readonly string containerName;
        private readonly IEmServiceResolverFactory parent;

        internal EmServiceResolver(string containerName, IEmServiceResolverFactory parent)
        {
            this.containerName = containerName;
            this.parent = parent;
        }


        public object Resolve(Type type, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
        {
            return parent.Resolve(type, containerName);
        }

        public object Resolve(Type type, object parameter, string container = null)
        {
            return parent.Resolve(type, parameter, containerName);
        }

        public TService Resolve<TService>(string container = null) where TService : class
        {
            return parent.Resolve<TService>(containerName);
        }

        public TService Resolve<TService>(object parameter, string container = null) where TService : class
        {
            return parent.Resolve<TService>(parameter, containerName);
        }

        public IEnumerable<TService> ResolveAll<TService>(string container = null) where TService : class
        {
            return parent.ResolveAll<TService>(containerName);
        }

        public TService ResolveByName<TService>(string name, string container = null) where TService : class
        {
            return parent.ResolveByName<TService>(name, containerName);
        }

        public TService ResolveByName<TService>(string name, object parameter,
            string container = null) where TService : class
        {
            return parent.ResolveByName<TService>(name, parameter, containerName);
        }
    }
}
