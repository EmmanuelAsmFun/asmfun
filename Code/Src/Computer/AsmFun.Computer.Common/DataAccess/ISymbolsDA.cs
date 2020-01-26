using AsmFun.Computer.Common.Data;

namespace AsmFun.Computer.Common.DataAccess
{
    public interface ISymbolsDA
    {
        SymbolItem Get(int index);
        SymbolItem Get(string name);
        ushort GetAsShort(string name);
        void Read();
    }
}
