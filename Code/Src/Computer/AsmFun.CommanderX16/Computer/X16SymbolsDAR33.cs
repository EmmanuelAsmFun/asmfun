using AsmFun.Computer.Common.Computer.Data;
using System.IO;

namespace AsmFun.CommanderX16.Computer
{
    public class X16SymbolsDAR33 : X16SymbolsDA
    {
        public X16SymbolsDAR33(ComputerSetupSettings computerSettings) : base(computerSettings)
        {
        }

        protected override void OnRead()
        {
            var fullFileName = Path.Combine(GetFolder(), "rom.sym");
            Read(fullFileName);
        }
    }
}
