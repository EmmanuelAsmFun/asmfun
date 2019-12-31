#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Collections.Generic;
using AsmFun.Common.Ide.Data.Programm;
using AsmFun.Ide.Common.Data.Dissasembly;

namespace AsmFun.Ide.Common.DataAccess
{
    public interface ILifeMemoryAccess
    {
        List<SourceCodeLabel> GetLabels();
        SourceCodeLabel GetLabel(string name);
        SourceCodeLabel ChangeLabelValue(string name, int newValue);
        List<SourceCodeLabel> GetLabelValues(List<PropertyData> properties);
    }
}