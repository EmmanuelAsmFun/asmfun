#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using System;
using System.Diagnostics;

namespace AsmFun.Core.ServiceLoc
{
    [DebuggerDisplay("Subscription:{Name}:{Type.Name}:Instanciated={Instance != null}")]
    internal class ServiceSubscription<TService> : IServiceSubscription, IEmServiceSubscription<TService>
    {
        public string Name { get; set; }
        public Type Type { get; set; }


        public Func<TService> Constructor { get; set; }
        public Func<object, TService> ConstructorWithParameter { get; set; }
        public TService Instance { get; private set; }
        public EmServiceLifestyle Lifestyle { get; set; }

        public void Dispose()
        {
            if (Instance != null && Instance is IDisposable)
                ((IDisposable)Instance).Dispose();
        }

        public void SetInstance(TService service)
        {
            if (Instance != null)
                Dispose();
            Instance = service;
        }

        public TService Resolve()
        {
            if (Constructor == null)
                throw new Exception("Constructor method has not been set in the service resolver for " + typeof(TService).FullName + ". Add the method WithConstructor(()=> new Object()) when defining the interface.");
            if (Lifestyle == EmServiceLifestyle.Transient)
                return Constructor();
            if (Instance == null)
                Instance = Constructor();
            return Instance;
        }
        public TService Resolve(object parameter)
        {
            if (ConstructorWithParameter == null)
                throw new Exception("Constructor method has not been set in the service resolver for " + typeof(TService).FullName + ". Add the method WithConstructor(()=> new Object()) when defining the interface.");
            if (Lifestyle == EmServiceLifestyle.Transient)
                return ConstructorWithParameter(parameter);
            if (Instance == null)
                Instance = ConstructorWithParameter(parameter);
            return Instance;
        }
        public TServiceT Resolve<TServiceT>() where TServiceT : class
        {
            return Resolve() as TServiceT;
        }
        public TServiceT Resolve<TServiceT>(object parameter) where TServiceT : class
        {
            return Resolve(parameter) as TServiceT;
        }

        public object ResolveObj()
        {
            return Resolve();
        }
        public object ResolveObj(object parameter)
        {
            return Resolve(parameter);
        }

        public IEmServiceSubscription<TService> WithConstructor(Func<TService> constructor)
        {
            Constructor = constructor;
            return this;
        }

        public IEmServiceSubscription<TService> WithConstructor(Func<object, TService> constructor)
        {
            ConstructorWithParameter = constructor;
            return this;
        }

        public IEmServiceSubscription WithLifestyle(EmServiceLifestyle lifeStyle)
        {
            Lifestyle = lifeStyle;
            return this;
        }

        public TService1 GetInstance<TService1>() where TService1 : class
        {
            return Instance as TService1;
        }

    }
    }
