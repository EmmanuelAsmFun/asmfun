#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Collections.Generic;
using AsmFun.Ide.Common.Data.Dissasembly;
using AsmFun.Ide.Common.Data.Programm;

namespace AsmFun.Ide.Common.DataAccess
{
    public interface ILifeMemoryAccess
    {
        List<AddressDataLabel> GetLabels();
        AddressDataLabel GetLabel(string name);
        AddressDataLabel ChangeLabelValue(string name, int newValue);
        List<AddressDataLabel> GetLabelValues(List<PropertyData> properties);
    }
}