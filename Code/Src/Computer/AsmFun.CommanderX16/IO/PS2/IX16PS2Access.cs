// Heavely inspired from https://github.com/commanderx16/x16-emulator

namespace AsmFun.CommanderX16.IO
{
    public interface IX16PS2Access
    {
        void KeyPressed(byte keyCode);
        void Step();
        void SetDataFromViaPA(byte via2reg1, byte via2reg3);
        byte GetValueForViaPA(byte via2reg3);

        byte GetValueForViaPB(byte via2reg2);
        void SetDataFromViaPB(byte via2reg0, byte via2reg2);
        void MouseButtonDown(int index);
        void MouseButtonUp(int index);
        void MouseMove(int x, int y);
    }
}
