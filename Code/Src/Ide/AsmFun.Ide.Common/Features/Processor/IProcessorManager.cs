#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Collections.Generic;
using AsmFun.Computer.Common.Processors;
using AsmFun.Ide.Common.Features.Compilation.Data;
using AsmFun.Ide.Common.Features.Debugger.Data;

namespace AsmFun.Ide.Common.Features.Processor
{
    public interface IProcessorManager
    {
        ProcessorDataModel GetData();
        List<AddressDataLabel> GetLabels();
        ProcessorStackModel GetStack();
        List<AddressDataLabel> GetLabelValues(List<PropertyData> properties);
    }
}