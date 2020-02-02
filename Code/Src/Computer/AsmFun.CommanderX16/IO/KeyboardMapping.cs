using AsmFun.Computer.Common.IO;
using System;
using System.Collections.Generic;
using System.Linq;

namespace AsmFun.CommanderX16.IO
{

    public class KeyboardMapping : IKeyboardMapping
    {
        private List<KeyMap> keyMappings = new List<KeyMap>();
        private readonly Action[] keymapParsers;

        public List<string> Keymaps { get; private set; }


        public KeyboardMapping()
        {
            Keymaps = new List<string>{
                "en-us",
                "en-gb",
                "de",
                "nordic",
                "it",
                "pl",
                "hu",
                "es",
                "fr",
                "de-ch",
                "fr-be",
                "pt-br",
            };
            keymapParsers = new Action[] { P, P, P, P, P, P, P, P, P, P, BE, P, P };
        }

        public bool Select(byte keymapIndex)
        {
            if (keymapIndex > Keymaps.Count) return false;
            // Make a copy of the default keymaps
            keyMappings = new List<KeyMap>(defaultKeyMappings);
            // Replace all language specific keys
            keymapParsers[keymapIndex]();
            return true;
        }
        public KeyMap Get(char character)
        {
            return keyMappings.FirstOrDefault(m => m.SourceKey == character);
        }

        private List<KeyMap> defaultKeyMappings = new List<KeyMap> { 
            // Alphabet
            new KeyMap('a', 0x1C),new KeyMap('b', 0x32),new KeyMap('c', 0x21),new KeyMap('d', 0x23),
            new KeyMap('e', 0x24),new KeyMap('f', 0x2B),new KeyMap('g', 0x34),new KeyMap('h', 0x33),
            new KeyMap('i', 0x43),new KeyMap('j', 0x3B),new KeyMap('k', 0x42),new KeyMap('l', 0x4B),
            new KeyMap('m', 0x3A),new KeyMap('n', 0x31),new KeyMap('o', 0x44),new KeyMap('p', 0x4D),
            new KeyMap('q', 0x15),new KeyMap('r', 0x2D),new KeyMap('s', 0x1B),new KeyMap('t', 0x2C),
            new KeyMap('u', 0x3C),new KeyMap('v', 0x2A),new KeyMap('w', 0x1A),new KeyMap('x', 0x22),
            new KeyMap('y', 0x35),new KeyMap('z', 0x1A),
            // Numbers
            new KeyMap('0',0x59,0x45),new KeyMap('1',0x59,0x16),new KeyMap('2',0x59,0x1E),new KeyMap('3',0x59,0x26),
            new KeyMap('4',0x59,0x25),new KeyMap('5',0x59,0x2E),new KeyMap('6',0x59,0x36),new KeyMap('7',0x59,0x3D),
            new KeyMap('8',0x59,0x3E),new KeyMap('9',0x59,0x46),
            // Symbols
            new KeyMap(' ', 0x29), new KeyMap(',', 0x41),new KeyMap('.', 0x49),new KeyMap(':', 0x59,0x4C),new KeyMap(';', 0x4C),
            new KeyMap('+', 0x59, 0x55),new KeyMap('-', 0x4E),new KeyMap('_',0x59, 0x4E),
            new KeyMap('%', 0x59, 0x2E),new KeyMap('£', 0x5D),
            new KeyMap('$', 0x59, 0x25), new KeyMap('&', 0x59, 0x3D), new KeyMap('!', 0x59, 0x16),new KeyMap('*', 0x59, 0x3E),new KeyMap('^', 0x59, 0x36),
            new KeyMap('=', 0x55), new KeyMap('?', 0x59, 0x4A),
            new KeyMap('<', 0x59,0x41),new KeyMap('>', 0x59, 0x49),
            new KeyMap('(', 0x59,0x46), new KeyMap(')', 0x59,0x45),new KeyMap('/', 0x4A), // must be 59 140 on querty
            // Quotes
            new KeyMap('"',0x59, 0x52), new KeyMap('\'',0x52),
            // Alt Gr
            new KeyMap('[', 0x111, 0x14,0x54),new KeyMap(']', 0x111, 0x14,0x5B),
            new KeyMap('@', 0X111, 0x14,0x1E),new KeyMap('#', 0x59, 0x26),
            // Specials
            new KeyMap('\n', 0x5A),
                };


        private void P() { }
        private void BE()
        {
            ReplaceKeyMap('a', new KeyMap('q', 0x1C));
            ReplaceKeyMap('q', new KeyMap('a', 0x15));
            ReplaceKeyMap('z', new KeyMap('w', 0x1A));
            ReplaceKeyMap('w', new KeyMap('z', 0x1D));
            ReplaceKeyMap('m', new KeyMap('m', 0x4C));

            // 1 keys
            ReplaceKeyMap('!', new KeyMap('!', 0x3E));
            ReplaceKeyMap('#', new KeyMap('#', 0X111, 0x14, 0x26));
            ReplaceKeyMap('$', new KeyMap('$', 0x5B));
            ReplaceKeyMap('%', new KeyMap('%', 0x59, 0x52));
            ReplaceKeyMap('^', new KeyMap('^', 0x59, 0x36)); // arrow up
            ReplaceKeyMap('&', new KeyMap('&', 0x16));
            ReplaceKeyMap('*', new KeyMap('*', 0x59, 0x5B));
            ReplaceKeyMap('(', new KeyMap('(', 0x2E));
            ReplaceKeyMap(')', new KeyMap(')', 0x4E));
            ReplaceKeyMap('=', new KeyMap('=', 0x4A));
            ReplaceKeyMap('+', new KeyMap('+', 0x59, 0x4A));
            ReplaceKeyMap('-', new KeyMap('-', 0x55));

            // 3 keys 
            ReplaceKeyMap(';', new KeyMap(';', 0x41));
            ReplaceKeyMap(':', new KeyMap(':', 0x49));
            ReplaceKeyMap('\'', new KeyMap('\'', 0x25));
            ReplaceKeyMap('£', new KeyMap('£', 0x59, 0x5D));
            // 4 keys
            ReplaceKeyMap(',', new KeyMap(',', 58));
            ReplaceKeyMap('.', new KeyMap('.', 0x59, 0x71));
            ReplaceKeyMap('"', new KeyMap('"', 0x26));
            ReplaceKeyMap('<', new KeyMap('<', 0x61));
            ReplaceKeyMap('>', new KeyMap('>', 0x59, 0x61));
            ReplaceKeyMap('/', new KeyMap('/', 0x59, 0x49));
            ReplaceKeyMap('?', new KeyMap('?', 0x59, 0x3A));
        }

        public int GetSpecialKey( byte keyNum)
        {
            var scancode = -1;
            switch (keyNum)
            {
                case 2: scancode = 0x66; break;     // Backspace
                case 6: scancode = 0x5A; break;     // ENTER
                case 18: scancode = 0x29; break;     // SPACE
                case 24: scancode = 0x175; break;     // UP
                case 26: scancode = 0x172; break;     // DOWN
                case 23: scancode = 0x16B; break;     // LEFT
                case 25: scancode = 0x174; break;     // RIGHT
                case 13: scancode = 0x76; break;     // ESC
                case 90: scancode = 0x05; break;     // F1
                case 91: scancode = 0x06; break;     // F2
                case 92: scancode = 0x04; break;     // F3
                case 93: scancode = 0x0C; break;     // F4
                case 94: scancode = 0x03; break;     // F5
                case 95: scancode = 0x0B; break;     // F6
                case 96: scancode = 0x83; break;     // F7
                case 97: scancode = 0x0A; break;     // F8
                case 98: scancode = 0x01; break;     // F9
                case 99: scancode = 0x09; break;     // F10
                case 100: scancode = 0x78; break;     // F11
                case 101: scancode = 0x07; break;     // F12
            }
            return scancode;
        }

       

        private void ReplaceKeyMap(char previousChar, KeyMap keyMap)
        {
            var index = defaultKeyMappings.FindIndex(item => item.SourceKey == previousChar);
            keyMappings[index] = keyMap;
        }

    }
}
