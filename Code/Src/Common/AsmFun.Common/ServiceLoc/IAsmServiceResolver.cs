#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System;
using System.Collections.Generic;

namespace AsmFun.Common.ServiceLoc
{

    public interface IEmServiceResolver
    {

        object Resolve(Type type, string container = EmServiceResolverConst.CONTAINER_DEFAULT);
        object Resolve(Type type, object parameter, string container = EmServiceResolverConst.CONTAINER_DEFAULT);
        TService Resolve<TService>(string container = EmServiceResolverConst.CONTAINER_DEFAULT) where TService : class;
        TService Resolve<TService>(object parameter, string container = EmServiceResolverConst.CONTAINER_DEFAULT) where TService : class;

        IEnumerable<TService> ResolveAll<TService>(string container = EmServiceResolverConst.CONTAINER_DEFAULT)
            where TService : class;

        TService ResolveByName<TService>(string name, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
             where TService : class;
        TService ResolveByName<TService>(string name, object parameter, string container = EmServiceResolverConst.CONTAINER_DEFAULT)
            where TService : class;
    }
    


}
