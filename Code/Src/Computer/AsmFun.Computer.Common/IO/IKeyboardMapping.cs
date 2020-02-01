using System.Collections.Generic;

namespace AsmFun.Computer.Common.IO
{
    public interface IKeyboardMapping
    {
        List<string> Keymaps { get; }


        bool Select(byte keymapIndex);
        KeyMap Get(char character);
        int GetSpecialKey(byte keyNum);


    }
}
