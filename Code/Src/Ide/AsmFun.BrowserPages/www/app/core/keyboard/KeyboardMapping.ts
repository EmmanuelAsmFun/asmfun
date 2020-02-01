

export class KeyMap {
    public SourceKey: string;
    public CharNum : number;
    public Modifier: number = -1;
    public Modifier1: number = -1;

    public constructor(sourceKey: string, charNum: number) {
        this.SourceKey = sourceKey;
        this.CharNum = charNum;
    }
    public static Nw1(sourceKey: string, modifier: number, charNum: number): KeyMap {
        return {
            SourceKey: sourceKey,
            CharNum: charNum,
            Modifier: modifier,
            Modifier1: -1,
        };
    }
    public static Nw2(sourceKey: string, modifier1: number, modifier: number, charNum: number): KeyMap {
        return {
            SourceKey: sourceKey,
            CharNum: charNum,
            Modifier: modifier,
            Modifier1: modifier1,
        };
    }
}

export class KeyboardMapping {

    private keymapParsers: (() => void)[] = [];
    public KeyMaps = [
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
    ];

    private keyMappings: KeyMap[] = [];
    private defaultKeyMappings: KeyMap[] = [
        // Alphabet
        new KeyMap('a', 0x1C), new KeyMap('b', 0x32), new KeyMap('c', 0x21), new KeyMap('d', 0x23),
        new KeyMap('e', 0x24), new KeyMap('f', 0x2B), new KeyMap('g', 0x34), new KeyMap('h', 0x33),
        new KeyMap('i', 0x43), new KeyMap('j', 0x3B), new KeyMap('k', 0x42), new KeyMap('l', 0x4B),
        new KeyMap('m', 0x3A), new KeyMap('n', 0x31), new KeyMap('o', 0x44), new KeyMap('p', 0x4D),
        new KeyMap('q', 0x15), new KeyMap('r', 0x2D), new KeyMap('s', 0x1B), new KeyMap('t', 0x2C),
        new KeyMap('u', 0x3C), new KeyMap('v', 0x2A), new KeyMap('w', 0x1A), new KeyMap('x', 0x22),
        new KeyMap('y', 0x35), new KeyMap('z', 0x1A),
        // Numbers
        KeyMap.Nw1('0', 0x59, 0x45), KeyMap.Nw1('1', 0x59, 0x16), KeyMap.Nw1('2', 0x59, 0x1E), KeyMap.Nw1('3', 0x59, 0x26),
        KeyMap.Nw1('4', 0x59, 0x25), KeyMap.Nw1('5', 0x59, 0x2E), KeyMap.Nw1('6', 0x59, 0x36), KeyMap.Nw1('7', 0x59, 0x3D),
        KeyMap.Nw1('8', 0x59, 0x3E), KeyMap.Nw1('9', 0x59, 0x46),
        // Symbols
        new KeyMap(' ', 0x29), new KeyMap(',', 0x41), new KeyMap('.', 0x49), KeyMap.Nw1(':', 0x59, 0x4C), new KeyMap(';', 0x4C),
        KeyMap.Nw1('+', 0x59, 0x55), new KeyMap('-', 0x4E), KeyMap.Nw1('_', 0x59, 0x4E),
        KeyMap.Nw1('%', 0x59, 0x2E), new KeyMap('£', 0x5D),
        KeyMap.Nw1('$', 0x59, 0x25), KeyMap.Nw1('&', 0x59, 0x3D), KeyMap.Nw1('!', 0x59, 0x16), KeyMap.Nw1('*', 0x59, 0x3E), KeyMap.Nw1('^', 0x59, 0x36),
        new KeyMap('=', 0x55), KeyMap.Nw1('?', 0x59, 0x4A),
        KeyMap.Nw1('<', 0x59, 0x41), KeyMap.Nw1('>', 0x59, 0x49),
        KeyMap.Nw1('(', 0x59, 0x46), KeyMap.Nw1(')', 0x59, 0x45), new KeyMap('/', 0x4A), // must be 59 140 on querty
        // Quotes
        KeyMap.Nw1('"', 0x59, 0x52), new KeyMap('\'', 0x52),
        // Alt Gr
        KeyMap.Nw2('[', 0x111, 0x14, 0x54), KeyMap.Nw2(']', 0x111, 0x14, 0x5B),
        KeyMap.Nw2('@', 0X111, 0x14, 0x1E), KeyMap.Nw1('#', 0x59, 0x26),
        // Specials
        new KeyMap('\n', 0x5A),
    ];
    

    public constructor() {
        this.keymapParsers = [
            () => this.P(), () => this.P(), () => this.P(), () => this.P(), () => this.P(),
            () => this.P(), () => this.P(), () => this.P(), () => this.P(), () => this.P(),
            () => this.BE(), () => this.P(), () => this.P()];
    }

    private P() { }

    private BE() {
        this.ReplaceKeyMap('a', new KeyMap('q', 0x1C));
        this.ReplaceKeyMap('q', new KeyMap('a', 0x15));
        this.ReplaceKeyMap('z', new KeyMap('w', 0x1A));
        this.ReplaceKeyMap('w', new KeyMap('z', 0x1D));
        this.ReplaceKeyMap('m', new KeyMap('m', 0x4C));

        // keys 1
        this.ReplaceKeyMap('!', new KeyMap('!', 0x3E));
        this.ReplaceKeyMap('#', KeyMap.Nw2('#', 0X111, 0x14, 0x26));
        this.ReplaceKeyMap('$', new KeyMap('$', 0x5B));
        this.ReplaceKeyMap('%', KeyMap.Nw1('%', 0x59, 0x52));
        this.ReplaceKeyMap('^', KeyMap.Nw1('^', 0x59, 0x36)); // arrow up
        this.ReplaceKeyMap('&', new KeyMap('&', 0x16));
        this.ReplaceKeyMap('*', KeyMap.Nw1('*', 0x59, 0x5B));
        this.ReplaceKeyMap('(', new KeyMap('(', 0x2E));
        this.ReplaceKeyMap(')', new KeyMap(')', 0x4E));
        this.ReplaceKeyMap('=', new KeyMap('=', 0x4A));
        this.ReplaceKeyMap('+', KeyMap.Nw1('+', 0x59, 0x4A));
        this.ReplaceKeyMap('-', new KeyMap('-', 0x55));

        // 3 keys 
        this.ReplaceKeyMap(';', new KeyMap(';', 0x41));
        this.ReplaceKeyMap(':', new KeyMap(':', 0x49));
        this.ReplaceKeyMap('\'', new KeyMap('\'', 0x25));
        this.ReplaceKeyMap('£', KeyMap.Nw1('£', 0x59, 0x5D));
        // 4 keys
        this.ReplaceKeyMap(',', new KeyMap(',', 58));
        this.ReplaceKeyMap('.', KeyMap.Nw1('.', 0x59, 0x71));
        this.ReplaceKeyMap('"', new KeyMap('"', 0x26));
        this.ReplaceKeyMap('<', new KeyMap('<', 0x61));
        this.ReplaceKeyMap('>', KeyMap.Nw1('>', 0x59, 0x61));
        this.ReplaceKeyMap('/', KeyMap.Nw1('/', 0x59, 0x49));
        this.ReplaceKeyMap('?', KeyMap.Nw1('?', 0x59, 0x3A));
    }

    public GetSpecialKey(character: string) {
        var scancode = -1;
        switch (character) {
            case "Backspace": scancode = 0x66; break;     // Backspace
            case "Enter": scancode = 0x5A; break;     // ENTER
            case " ": scancode = 0x29; break;     // SPACE
            case "ArrowUp": scancode = 0x175; break;     // UP
            case "ArrowDown": scancode = 0x172; break;     // DOWN
            case "ArrowLeft": scancode = 0x16B; break;     // LEFT
            case "ArrowRight": scancode = 0x174; break;     // RIGHT
            case "F1": scancode = 0x05; break;     // F1
            case "F2": scancode = 0x06; break;     // F2
            case "F3": scancode = 0x04; break;     // F3
            case "F4": scancode = 0x0C; break;     // F4
            case "F5": scancode = 0x03; break;     // F5
            case "F6": scancode = 0x0B; break;     // F6
            case "F7": scancode = 0x83; break;     // F7
            case "F8": scancode = 0x0A; break;     // F8
            case "F9": scancode = 0x01; break;     // F9
            case "F10": scancode = 0x09; break;     // F10
            case "F11": scancode = 0x78; break;     // F11
            case "F12": scancode = 0x07; break;     // F12
        }
        return scancode;
    }

    public Get(character: string) {
        return this.keyMappings.find(m => m.SourceKey == character);
    }

    public SelectKeyMap(keymapIndex: number) {
        if (keymapIndex > this.KeyMaps.length) return;
        // make a copy of the default mappings.
        this.keyMappings = [... this.defaultKeyMappings];
        // Replace all culture specific keys.
        this.keymapParsers[keymapIndex]();
    }

    private ReplaceKeyMap(previousChar: string, keyMap: KeyMap) {
        var index = this.defaultKeyMappings.findIndex(item => item.SourceKey == previousChar);
        this.keyMappings[index] = keyMap;
    }

}