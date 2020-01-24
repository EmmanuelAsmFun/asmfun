#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.ServiceLoc;
using System;
using System.Collections.Generic;
using System.Text;

namespace AsmFun.Core.ServiceLoc
{
    
    internal interface IServiceSubscription
    {
        string Name { get; set; }
        Type Type { get; set; }
        EmServiceLifestyle Lifestyle { get; set; }
        void Dispose();
        TService Resolve<TService>() where TService : class;
        TService Resolve<TService>(object parameter) where TService : class;
        object ResolveObj();
        object ResolveObj(object parameter);
    }
}
