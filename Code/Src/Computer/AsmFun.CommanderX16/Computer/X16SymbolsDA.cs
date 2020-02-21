using AsmFun.Computer.Common.Computer.Data;
using AsmFun.Computer.Common.Memory;
using AsmFun.Computer.Core.Memory;

namespace AsmFun.CommanderX16.Computer
{
    public class X16SymbolsDA : SymbolsDA
    {
        public X16SymbolsDA(ComputerSetupSettings computerSettings) : base(computerSettings)
        {
        }

        protected override void InjectDescription(SymbolItem item)
        {
            base.InjectDescription(item);
            switch (item.Name)
            {
                case nameof(X16ComputerAccess.VARTAB): item.Description = "End address of program"; item.Length = 2; break;
                case nameof(X16ProgramAccess.FA): item.Description = "Load/Save device address"; item.Length = 2; break;
                case nameof(X16ProgramAccess.FNLEN): item.Description = "Load/Save: Length of the filename"; item.Length = 2; break;
                case nameof(X16ProgramAccess.FNADR): item.Description = "Load/Save: The address where the filename"; item.Length = 2; break;
                case nameof(X16ProgramAccess.STATUS): item.Description = "Load/Save: The status byte if reading or writing"; item.Length = 2; break;
            }
        }
    }
}
