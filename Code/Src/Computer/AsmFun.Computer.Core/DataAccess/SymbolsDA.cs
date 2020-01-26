using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Data;
using AsmFun.Computer.Common.DataAccess;
using System.Collections.Generic;
using System.IO;
using System.Linq;

namespace AsmFun.Computer.Core.DataAccess
{
    public class SymbolsDA : ISymbolsDA
    {
        private readonly ComputerSetupSettings computerSettings;
        private List<SymbolItem> items = new List<SymbolItem>();
        private Dictionary<int, SymbolItem> itemsByAddress = new Dictionary<int, SymbolItem>();
        private Dictionary<string, SymbolItem> itemsByName = new Dictionary<string, SymbolItem>();
        private string lastLoadedVersion;

        public SymbolItem Get(int index)
        {
            if (itemsByName.Count == 0) Read();
            return itemsByAddress[index];
        }  
        public SymbolItem Get(string name)
        {
            if (itemsByName.Count == 0) Read();
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

        public SymbolsDA(ComputerSetupSettings computerSettings)
        {
            this.computerSettings = computerSettings;
        }

        public void Read()
        {
            lastLoadedVersion = computerSettings.Version;
            var startFolder = Path.GetDirectoryName(System.Reflection.Assembly.GetEntryAssembly().Location);
            var fullFileName = Path.Combine(startFolder, computerSettings.ComputerTypeShort, computerSettings.Version, "rom.sym");
            if (!File.Exists(fullFileName))
                throw new FileNotFoundException("The Symbols of the ROM file was not found", fullFileName);
            var lines = File.ReadAllLines(fullFileName);
            foreach (var line in lines)
            {
                var parts = line.Split(' ');
                if (parts.Length < 3) continue;
                int address;
                if (!int.TryParse(parts[1], System.Globalization.NumberStyles.HexNumber, null,out address))
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

        public List<SymbolItem> GetAll()
        {
            if (itemsByName.Count == 0) Read();
            // Make a clone
            return items.ToList();
        }

        protected virtual void InjectDescription(SymbolItem item)
        {

        } 

       
    }
}
