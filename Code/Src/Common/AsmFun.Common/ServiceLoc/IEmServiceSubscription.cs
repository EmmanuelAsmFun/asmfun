#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;

namespace AsmFun.Common.ServiceLoc
{
    public interface IEmServiceSubscription
    {
        string Name { get; }
        Type Type { get; }

        TService GetInstance<TService>() where TService : class;

        IEmServiceSubscription WithLifestyle(EmServiceLifestyle lifeStyle);
    }

    public interface IEmServiceSubscription<TService> : IEmServiceSubscription
    {

        IEmServiceSubscription<TService> WithConstructor(Func<TService> constructor);
        IEmServiceSubscription<TService> WithConstructor(Func<object, TService> constructor);
        //IEmServiceSubscription<TService> WithLifestyle(EmServiceLifestyle lifeStyle);
    }
}
