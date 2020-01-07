﻿#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using AsmFun.Computer.Common;
using AsmFun.Computer.Common.Computer.Data;
using System;
using System.Collections.Generic;

namespace AsmFun.Computer.Core.Computer
{
    public abstract class ComputerFactory : IComputerFactory
    {
        private readonly List<Type> _usedServices = new List<Type>();
        private readonly IEmServiceResolverFactory container;
        public string ComputerType { get; protected set; }
        public string ComputerVersion { get; protected set; }

        public ComputerFactory(IEmServiceResolverFactory resolverFactory)
        {
            container = resolverFactory;
        }

        public abstract IComputer Create();

        protected TService Resolve<TService>()
            where TService : class
        {
            return container.Resolve<TService>();
        }

        protected IEmServiceSubscription<TService> Add<TService, TClassService>()
          where TClassService : TService
        {
            _usedServices.Add(typeof(TService));
            return container.Add<TService, TClassService>();
        }
        protected IEmServiceSubscription<TService> Add<TService>()
        {
            _usedServices.Add(typeof(TService));
            return container.Add<TService>();
        } 
        protected IEmServiceSubscription<TService> Add<TService>(Func<TService> constructor)
        {
            _usedServices.Add(typeof(TService));
            return container.Add<TService>(constructor);
        }

        protected List<Type> GetUsedServices()
        {
            return _usedServices;
        }
    }
}