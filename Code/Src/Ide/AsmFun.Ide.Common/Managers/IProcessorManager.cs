#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Collections.Generic;
using AsmFun.Computer.Common.Processors;
using AsmFun.Ide.Common.Data.Dissasembly;
using AsmFun.Ide.Common.Data.Programm;

namespace AsmFun.Ide.Common.Managers
{
    public interface IProcessorManager
    {
        ProcessorDataModel GetData();
        List<AddressDataLabel> GetLabels();
        ProcessorStackModel GetStack();
        List<AddressDataLabel> GetLabelValues(List<PropertyData> properties);
    }
}