#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using System.Collections.Generic;
using AsmFun.Common.Ide.Data.Programm;
using AsmFun.Computer.Common.Processors;
using AsmFun.Ide.Common.Data.Dissasembly;

namespace AsmFun.Ide.Common.Managers
{
    public interface IProcessorManager
    {
        ProcessorDataModel GetData();
        List<SourceCodeLabel> GetLabels();
        ProcessorStackModel GetStack();
        List<SourceCodeLabel> GetLabelValues(List<PropertyData> properties);
    }
}