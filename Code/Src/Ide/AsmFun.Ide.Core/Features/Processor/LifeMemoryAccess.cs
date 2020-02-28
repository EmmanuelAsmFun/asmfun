#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Computer.Common.Computer;
using AsmFun.Ide.Common.Features.Compilation.Data;
using AsmFun.Ide.Common.Features.Debugger.Data;
using AsmFun.Ide.Common.Features.Processor;
using AsmFun.Ide.Common.Features.SourceCode;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AsmFun.Ide.Core.Features.Processor
{
    public class LifeMemoryAccess : ILifeMemoryAccess
    {
        private readonly ISourceCodeManager sourceCodeManager;
        private readonly IComputerManager computerManager;

        public LifeMemoryAccess(ISourceCodeManager sourceCodeManager, IComputerManager computerManager)
        {
            this.sourceCodeManager = sourceCodeManager;
            this.computerManager = computerManager;
        }

        public AddressDataLabel ChangeLabelValue(string name, int newValue)
        {
            var sc = sourceCodeManager.GetCurrentAddressData();
            if (sc == null) return null;
            var label = sc.Labels.FirstOrDefault(item => item.Name == name);
            if (label == null) return label;
            IComputerMemoryAccess memory = computerManager.GetComputer()?.GetMemory();
            memory.WriteByte((ushort)label.Address,(byte)newValue);
            label.Value = memory.ReadByte((ushort)label.Address);
            return label;
        } 
      
        public AddressDataLabel GetLabel(string name)
        {
            var sc = sourceCodeManager.GetCurrentAddressData();
            if (sc == null) return null;
            var label = sc.Labels.FirstOrDefault(item => item.Name == name);
            if (label == null) return label;
            IComputerMemoryAccess memory = computerManager.GetComputer()?.GetMemory();
            label.Value = memory.ReadByte((ushort)label.Address);
            return label;
        }
       

       
        public List<AddressDataLabel> GetLabelValues(List<PropertyData> properties)
        {
            var sc = sourceCodeManager.GetCurrentAddressData();
            if (sc == null || properties == null) return new List<AddressDataLabel>();
            foreach (var property in properties)
            {
                if (property == null) continue;
                var label = sc.Labels.FirstOrDefault(item => item.Name == property.Name);
                if (label == null) continue;
                label.Length = property.DataLength;
            }
            return GetLabelValues();
        }

        public List<AddressDataLabel> GetLabelValues()
        {
            var sc = sourceCodeManager.GetCurrentAddressData();
            if (sc == null) return new List<AddressDataLabel>();
            // We order the labels by address locally to be able to faster retrieve values from memory.
            var labels = sc.Labels.OrderBy(x => x.Address).ToList();
            ParseLabelValues(labels);
            return labels;
        }

        public void ParseLabelValues(List<AddressDataLabel> labels)
        {
            IComputerMemoryAccess memory = computerManager.GetComputer()?.GetMemory();
            if (memory == null) return;
            ParseLabelsValue(memory, labels);
        }


        internal void ParseLabelsValue(IComputerMemoryAccess memory, List<AddressDataLabel> labelsOrderedByAddress)
        {
            if (labelsOrderedByAddress == null || labelsOrderedByAddress.Count == 0) return;

            var lengthToRead = 1;
            var previousLabel = labelsOrderedByAddress[0];
            var labelsToParse = new List<AddressDataLabel>();
            // try to read in blocks
            for (int i = 1; i < labelsOrderedByAddress.Count; i++)
            {
                var label = labelsOrderedByAddress[i];
                if (label.Length == 0) continue;
                labelsToParse.Add(label);
                var addressesToRead = label.Address - previousLabel.Address;
                if (addressesToRead > 10 || i >= labelsOrderedByAddress.Count-1)
                {
                    // Read Label block
                    var startAddressToRead = labelsToParse[0].Address;
                    lengthToRead += label.Length;
                    var bufferR = memory.ReadBlock(startAddressToRead, lengthToRead);
                    var readOffset = 0;
                    for (int j = 0; j < labelsToParse.Count; j++)
                    {
                        var lab = labelsToParse[j];
                        
                        if (lab.Length > 1)
                        {
                            //if (lab.Length > 16)
                            //{

                            //}
                            var res = new byte[lab.Length];
                            Buffer.BlockCopy(bufferR, readOffset, res, 0, lab.Length);
                            lab.Values = res;
                            lab.Value = res[0];
                            readOffset += lab.Length;
                            continue;
                        }
                        
                        int theValue = bufferR[readOffset];
                        if (lab.Value != theValue)
                            lab.Value = theValue;
                        readOffset++;
                    }
                    labelsToParse.Clear();
                    lengthToRead = 1;
                }
                previousLabel = label;
                lengthToRead += label.Length;
            }
        }


    }
}
