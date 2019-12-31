#region license
// ASM Fun
// Copyright (c) 2019-2040 Emmanuel from ASMFun. Read the license file.
//
#endregion

using AsmFun.Common.Ide.Data.Programm;
using AsmFun.Computer.Common.Computer;
using AsmFun.Computer.Common.Managers;
using AsmFun.Ide.Common.Data.Dissasembly;
using AsmFun.Ide.Common.DataAccess;
using AsmFun.Ide.Common.Managers;
using System.Collections.Generic;
using System.Linq;

namespace AsmFun.Ide.Managers
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

        public SourceCodeLabel ChangeLabelValue(string name, int newValue)
        {
            var sc = sourceCodeManager.GetCurrent();
            if (sc == null) return null;
            var label = sc.Labels.FirstOrDefault(item => item.Name == name);
            if (label == null) return label;
            IComputerMemoryAccess memory = computerManager.GetComputer()?.GetMemory();
            memory.WriteByte((ushort)label.Address,(byte)newValue);
            label.Value = memory.ReadByte((ushort)label.Address);
            return label;
        } 
      
        public SourceCodeLabel GetLabel(string name)
        {
            var sc = sourceCodeManager.GetCurrent();
            if (sc == null) return null;
            var label = sc.Labels.FirstOrDefault(item => item.Name == name);
            if (label == null) return label;
            IComputerMemoryAccess memory = computerManager.GetComputer()?.GetMemory();
            label.Value = memory.ReadByte((ushort)label.Address);
            return label;
        }
       

        public List<SourceCodeLabel> GetLabels()
        {
            var sc = sourceCodeManager.GetCurrent();
            if (sc == null) return new List<SourceCodeLabel>();
            // We order the labels by address locally to be able to faster retrieve values from memory.
            var labels = sc.Labels.OrderBy(x => x.Address).ToList();
            IComputerMemoryAccess memory = computerManager.GetComputer()?.GetMemory();
            if (memory != null)
                ParseLabelsValue(memory, labels);
            return labels;
        }
        public List<SourceCodeLabel> GetLabelValues(List<PropertyData> properties)
        {
            var sc = sourceCodeManager.GetCurrent();
            if (sc == null || properties == null) return new List<SourceCodeLabel>();
            foreach (var property in properties)
            {
                var label = sc.Labels.FirstOrDefault(item => item.Name == property.Name);
                if (label == null) continue;
                label.VariableLength = property.DataLength;
            }
            return GetLabels();
        }


        internal void ParseLabelsValue(IComputerMemoryAccess memory, List<SourceCodeLabel> labelsOrderedByAddress)
        {
            if (labelsOrderedByAddress == null || labelsOrderedByAddress.Count == 0) return;

            var lengthToRead = 1;
            var previousLabel = labelsOrderedByAddress[0];
            var labelsToParse = new List<SourceCodeLabel>();
            // try to read in blocks
            for (int i = 1; i < labelsOrderedByAddress.Count; i++)
            {
                var label = labelsOrderedByAddress[i];
                labelsToParse.Add(label);
                var addressesToRead = label.Address - previousLabel.Address;
                if (addressesToRead > 10 || i >= labelsOrderedByAddress.Count-1)
                {
                    // Read Label block
                    var startAddressToRead = labelsToParse[0].Address;
                    var bufferR = memory.ReadBlock(startAddressToRead, lengthToRead);
                    for (int j = 0; j < labelsToParse.Count; j++)
                    {
                        // todo: check this
                        if (j >= bufferR.Length) break;
                        var lab = labelsToParse[j];
                        int theValue = bufferR[j];
                        if (lab.VariableLength == 2)
                            theValue = System.BitConverter.ToUInt16(new byte[] { bufferR[j], bufferR[j+1] }, 0);
                        if (lab.VariableLength == 3)
                            theValue = System.BitConverter.ToInt32(bufferR, j);
                        if (lab.VariableLength == 4)
                            theValue = System.BitConverter.ToInt32(bufferR, j);
                        if (lab.Value != theValue)
                            lab.Value = theValue;
                    }
                    labelsToParse.Clear();
                    lengthToRead = 1;
                }
                previousLabel = label;
                lengthToRead += label.VariableLength;
            }
        }


    }
}
