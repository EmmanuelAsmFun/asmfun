namespace AsmFun.Computer.Common.Memory
{
    public interface ISymbolsDA
    {
        SymbolItem Get(int index);
        SymbolItem Get(string name);
        ushort GetAsShort(string name);
        void Read();
    }
}
