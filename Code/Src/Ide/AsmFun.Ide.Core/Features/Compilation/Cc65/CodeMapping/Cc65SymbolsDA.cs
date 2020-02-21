using AsmFun.Computer.Common.Memory;
using System.Collections.Generic;
using System.IO;

namespace AsmFun.Ide.Core.Features.Compilation.Cc65.CodeMapping
{
    public class Cc65SymbolsDA
    {
        private List<SymbolItem> items = new List<SymbolItem>();
        private Dictionary<int, SymbolItem> itemsByAddress = new Dictionary<int, SymbolItem>();
        private Dictionary<string, SymbolItem> itemsByName = new Dictionary<string, SymbolItem>();

        public SymbolItem Get(int index)
        {
            return itemsByAddress[index];
        }
        public SymbolItem Get(string name)
        {
            var name2 = name.ToLower();
            if (itemsByName.ContainsKey(name2))
                return itemsByName[name2];
            return null;
        }

        public ushort GetAsShort(string name)
        {
            var item = Get(name);
            return item != null ? (ushort)item.Address : default;
        }

        public List<SymbolItem> GetAll()
        {
            return items;
        }

        public void Read(string fullFileName)
        {
            var lines = File.ReadAllLines(fullFileName);
            foreach (var line in lines)
            {
                var parts = line.Split(' ');
                if (parts.Length < 3) continue;
                int address;
                if (!int.TryParse(parts[1], System.Globalization.NumberStyles.HexNumber, null, out address))
                    continue;
                var name = parts[2].Trim('.').ToLower();
                var item = new SymbolItem
                {
                    Name = name,
                    Address = address,
                    Description = "",
                    Length = 1
                };
                InjectDescription(item);
                items.Add(item);
                if (!itemsByAddress.ContainsKey(address))
                    itemsByAddress.Add(address, item);
                if (!itemsByName.ContainsKey(name))
                    itemsByName.Add(name, item);
            }
        }

        protected virtual void InjectDescription(SymbolItem item)
        {

        }


    }
}