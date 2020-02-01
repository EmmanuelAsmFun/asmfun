using System.Diagnostics;

namespace AsmFun.Computer.Common.IO
{
    [DebuggerDisplay("KeyMap:{SourceKey}:{CharNum}:{Modifier}:{Modifier1}")]
    public struct KeyMap
    {
        public char SourceKey { get; set; }
        public int CharNum { get; set; }
        public int Modifier { get; set; }
        public int Modifier1 { get; set; }
        public KeyMap(char source, int charNum)
        {
            SourceKey = source;
            CharNum = charNum;
            Modifier = -1;
            Modifier1 = -1;
        }
        public KeyMap(char source, int modifier, int charNum)
        {
            SourceKey = source;
            CharNum = charNum;
            Modifier = modifier;
            Modifier1 = -1;
        }
        public KeyMap(char source, int modifier1, int modifier, int charNum)
        {
            SourceKey = source;
            CharNum = charNum;
            Modifier = modifier;
            Modifier1 = modifier1;
        }
    }

}
