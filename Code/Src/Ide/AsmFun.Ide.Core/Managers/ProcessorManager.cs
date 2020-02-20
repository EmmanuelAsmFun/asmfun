#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Managers;
using AsmFun.Computer.Common.Processors;
using AsmFun.Ide.Common.Data.Dissasembly;
using AsmFun.Ide.Common.Data.Programm;
using AsmFun.Ide.Common.DataAccess;
using AsmFun.Ide.Common.Managers;
using System;
using System.Collections.Generic;

namespace AsmFun.Ide.Core.Managers
{
    public class ProcessorManager : IProcessorManager
    {
        private readonly ISourceCodeManager sourceCodeManager;
        private readonly IComputerManager computerManager;
        private readonly ILifeMemoryAccess lifeMemoryAccess;

        public ProcessorManager(ISourceCodeManager sourceCodeManager, IComputerManager computerManager, ILifeMemoryAccess lifeMemoryAccess)
        {
            this.sourceCodeManager = sourceCodeManager;
            this.computerManager = computerManager;
            this.lifeMemoryAccess = lifeMemoryAccess;
        }


        public ProcessorDataModel GetData()
        {
            return GetCurrentProcessorData();
        }
        public ProcessorStackModel GetStack()
        {
            var comp = computerManager.GetComputer();
            if (comp == null) return new ProcessorStackModel();
            return comp.GetStack();
        }
        public List<AddressDataLabel> GetLabels()
        {
            return lifeMemoryAccess.GetLabels();
        }

        public List<AddressDataLabel> GetLabelValues(List<PropertyData> properties)
        {
            return lifeMemoryAccess.GetLabelValues(properties);
        }

        private ProcessorDataModel GetCurrentProcessorData()
        {
            var comp = computerManager.GetComputer();
            if (comp == null) return new ProcessorDataModel();
            var model = comp.GetProcessorData();
            model.IsComputerRunning = true;
            return model;
        }

       
    }
}
