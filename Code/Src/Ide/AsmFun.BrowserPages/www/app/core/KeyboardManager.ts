// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IAsmFunAppData } from "../data/AsmFunAppData.js"
import { IMainData } from "../data/MainData.js";
import { ServiceName } from "../serviceLoc/ServiceName.js";
import { ComputerService } from "../services/ComputerService.js";
import { IKeyboardKey } from "../data/ComputerData.js";

class KeyMap
{
    public Source: string;
    public TheChar: number;
    public Modifier: number = -1;
    public Modifier1: number = -1;

    public constructor(source: string,  theChar: number)
    {
        this.Source = source;
        this.TheChar = theChar;
    }
    public static Nw1(source: string, modifier: number, theChar: number): KeyMap {
        return {
            Source: source,
            TheChar: theChar,
            Modifier: modifier,
            Modifier1: -1,
        };
    }
    public static Nw2(source: string, modifier1: number, modifier: number, theChar: number): KeyMap {
        return {
            Source : source,
            TheChar : theChar,
            Modifier : modifier,
            Modifier1 : modifier1,
        };
    }
}
class KeyQueueItem {
    public TheKey: string;
    public KeyCode: number;
    public IsDown: boolean;
    public constructor(theKey: string, keyCode: number, isDown: boolean) {
        this.TheKey = theKey;
        this.KeyCode = keyCode;
        this.IsDown = isDown;
    }
}


export class KeyboardManager {
    private EXTENDED_FLAG: number = 0x100;
    private isRunningPasteMethod = false;
    private shiftIsDown = false;
    private ctrlIsDown = false;
    private altGrIsDown = false;

    private invalidChars = ['{', '}', '\t', '_'];
    private mainData: IMainData;
    private myAppData: IAsmFunAppData;
    private computerService: ComputerService;
    public isEnabled: boolean = false;
    private lastClipBoardText: string | null = null;
    
     public AllKeyMaps = [
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

    constructor(mainData: IMainData) {
        var thiss = this;
        this.mainData = mainData;
        this.myAppData = mainData.appData;
        this.computerService = this.mainData.container.Resolve<ComputerService>(ComputerService.ServiceName) ?? new ComputerService(mainData);
    }

  
    private keyMappingsAzertyBE: KeyMap[] = [
        // Alphabet
        new KeyMap('a', 0x15), new KeyMap('b', 0x32), new KeyMap('c', 0x21), new KeyMap('d', 0x23),
        new KeyMap('e', 0x24), new KeyMap('f', 0x2B), new KeyMap('g', 0x34), new KeyMap('h', 0x33),
        new KeyMap('i', 0x43), new KeyMap('j', 0x3B), new KeyMap('k', 0x42), new KeyMap('l', 0x4B),
        new KeyMap('m', 0x4C), new KeyMap('n', 0x31), new KeyMap('o', 0x44), new KeyMap('p', 0x4D),
        new KeyMap('q', 0x1C), new KeyMap('r', 0x2D), new KeyMap('s', 0x1B), new KeyMap('t', 0x2C),
        new KeyMap('u', 0x3C), new KeyMap('v', 0x2A), new KeyMap('w', 0x1A), new KeyMap('x', 0x22),
        new KeyMap('y', 0x35), new KeyMap('z', 0x5B),
        // Numbers
        KeyMap.Nw1('0', 0x59, 0x45), KeyMap.Nw1('1', 0x59, 0x16), KeyMap.Nw1('2', 0x59, 0x1E), KeyMap.Nw1('3', 0x59, 0x26),
        KeyMap.Nw1('4', 0x59, 0x25), KeyMap.Nw1('5', 0x59, 0x2E), KeyMap.Nw1('6', 0x59, 0x36), KeyMap.Nw1('7', 0x59, 0x3D),
        KeyMap.Nw1('8', 0x59, 0x3E), KeyMap.Nw1('9', 0x59, 0x46),
        // Symbols
        new KeyMap(' ', 0x29), new KeyMap(',', 58), KeyMap.Nw1('.', 0x59, 0x71), new KeyMap(':', 0x49), new KeyMap(';', 0x41),
        KeyMap.Nw1('+', 0x59, 0x4A), new KeyMap('-', 0x55),
        KeyMap.Nw1('%', 0x59, 0x52), KeyMap.Nw1('£', 0x59, 0x5D),
        new KeyMap('$', 0x5B), new KeyMap('&', 0x16), new KeyMap('!', 0x36), KeyMap.Nw1('*', 0x59, 0x5B),
        new KeyMap('=', 0x4A), KeyMap.Nw1('?', 0x59, 0x3A),
        new KeyMap('<', 0x61), KeyMap.Nw1('>', 0x59, 0x61),
        new KeyMap('(', 0x2E), new KeyMap(')', 0x4E), KeyMap.Nw1('/', 0x59, 0x49),
        // Quotes
        KeyMap.Nw1('\"', 0x59, 0x4C), new KeyMap('\'', 0x25),
        // Alt Gr
        KeyMap.Nw2('[', 0x111, 0x14, 0x54), KeyMap.Nw2(']', 0x111, 0x14, 0x5B),
        KeyMap.Nw2('@', 0X111, 0x14, 0x1E), KeyMap.Nw2('#', 0X111, 0x14, 0x26),
        // Specials
        new KeyMap('\n', 0x5A),
    ];




    public KeyDown(keyy: IKeyboardKey) {
        if (this.isRunningPasteMethod || !this.isEnabled) return;
        this.ctrlIsDown = keyy.ctrlKey;
        this.shiftIsDown = keyy.shiftKey;
        this.altGrIsDown = keyy.altKey;
        if(this.HandlePressedKey(new KeyQueueItem(keyy.key, keyy.which, true)))
            return false;
    }

    public KeyUp(keyy: IKeyboardKey) {
        if (this.isRunningPasteMethod || !this.isEnabled) return;
        this.ctrlIsDown = keyy.ctrlKey;
        this.shiftIsDown = keyy.shiftKey;
        this.altGrIsDown = keyy.altKey;
        if (this.HandlePressedKey(new KeyQueueItem(keyy.key, keyy.which, false)))
            return false;
    }

    public PressText(data: string) {
    if (data == null || data === "" || !this.isEnabled) return;
        for (var i = 0; i < data.length; i++) {
            this.ExecuteMapping(data[i]);
        }
    }

    private ExecuteMapping(item: string) {
        if (this.invalidChars.indexOf(item) < 0) return;
        if (item === '\r') return;
        if (item === '0') return; //0x00

        var mapping = this.keyMappingsAzertyBE.find(m => m.Source == item);
        if (mapping == null) return;
        if (mapping.Modifier1 == -1) {
            if (mapping.Modifier == -1) {
                this.DoScanCodeDown(mapping.TheChar);
                this.DoScanCodeUp(mapping.TheChar);
            }
            else {
                this.DoScanCodeDown(mapping.Modifier);
                this.DoScanCodeDown(mapping.TheChar);
                this.DoScanCodeUp(mapping.TheChar);
                this.DoScanCodeUp(mapping.Modifier);
            }
        }
        else {
            this.DoScanCodeDown(mapping.Modifier1);
            this.DoScanCodeDown(mapping.Modifier);
            this.DoScanCodeDown(mapping.TheChar);
            this.DoScanCodeUp(mapping.TheChar);
            this.DoScanCodeUp(mapping.Modifier);
            this.DoScanCodeUp(mapping.Modifier1);
        }
    }

    private HandlePressedKey(toWorkOn: KeyQueueItem) {
        var scancode = this.InterpretSpecialKey(toWorkOn.TheKey, toWorkOn.KeyCode, toWorkOn.IsDown);
        if (toWorkOn.IsDown) {
            if (scancode >= 0)
                this.DoScanCodeDown(scancode);
            else if (scancode == -1)
                this.MappingDown(toWorkOn.TheKey);
        }
        else {
            if (scancode >= 0)
                this.DoScanCodeUp(scancode);
            else if (scancode == -1)
                this.MappingUp(toWorkOn.TheKey);
        }
        return scancode > -1;
    }

    private MappingDown(key: string) {
        var mapping = this.keyMappingsAzertyBE.find(m => m.Source == key);
        if (mapping == null) return;
        this.DoScanCodeDown(mapping.TheChar);
    }

    private MappingUp(key: string) {
        var mapping = this.keyMappingsAzertyBE.find(m => m.Source == key);
        if (mapping == null) return;
        this.DoScanCodeUp(mapping.TheChar);
    }


    private DoScanCodeDown(scancode: number) {
        this.computerService.KeyRawDown([scancode], () => { });
        //var isExt = false;
        //if ((scancode & this.EXTENDED_FLAG) > 0) {
        //    isExt = true;
        //    this.SendToKeyboard(0xe0);
        //}
        //this.SendToKeyboard((scancode & 0xff));
    }

    private DoScanCodeUp(scancode: number, withBreak: boolean = true) {
        this.computerService.KeyRawUp([scancode], withBreak, () => { });
        //var isExt = false;
        //if ((scancode & this.EXTENDED_FLAG) > 0) {
        //    isExt = true;
        //    this.SendToKeyboard(0xe0);
        //}
        //if (withBreak)
        //    this.SendToKeyboard(0xf0); // BREAK
        //this.SendToKeyboard((scancode & 0xff));
    }

    private SendToKeyboard(scancode: number) {
        
    }

    private InterpretSpecialKey(kk3: string, theKey: number, isDown: boolean) {
        if (this.isRunningPasteMethod) return -2;
        if (this.ctrlIsDown) {
            //Console.Write("C " + theKey.ToString("X2")+",");
            // CTRL V
            if (theKey == 0x41) //'v' = 02A, wirth ctrl its 0x41
            {
                // send a keyUp for CTRL
                this.DoScanCodeUp(0x14);
                this.RunPasteMethod();
                return -2;
            }
        }
        var keyNum = theKey;
        var scancode = -1;
        switch (kk3) {
            case "Backspace": scancode = 0x66; break;     // Backspace
            case "Enter": scancode = 0x5A; break;     // ENTER
            case " ": scancode = 0x29; break;     // SPACE
            case "ArrowUp": scancode = 0x175; break;     // UP
            case "ArrowDown": scancode = 0x172; break;     // DOWN
            case "ArrowLeft": scancode = 0x16B; break;     // LEFT
            case "ArrowRight": scancode = 0x174; break;     // RIGHT
            case "1": case "2": case "3": case "4": case "5": case "6": case "7": case "8": case "9": case "0":     // NumPad 1 - 9
                scancode = this.DoNum(kk3, isDown) ?? -1; break;
            case "Control": scancode = 0x114; this.ctrlIsDown = isDown; break;     // RCTRL
            case "Control": scancode = 89; this.shiftIsDown = isDown; break;   // RSHIFT
            case "Shift": scancode = 0x12; this.shiftIsDown = isDown; break;     // LSHIFT
            case "Shift": scancode = 0x14; this.ctrlIsDown = isDown; break;     // LCTRL
            case "F1": scancode = 0x3A; break;     // F1
            case "F2": scancode = 0x3B; break;     // F2
            case "F3": scancode = 0x3C; break;     // F3
            case "F4": scancode = 0x3D; break;     // F4
            case "F5": scancode = 0x3E; break;     // F5
            case "F6": scancode = 0x3F; break;     // F6
            case "F7": scancode = 0x40; break;     // F7
            case "F8": scancode = 0x41; break;     // F8
            case "F9": scancode = 0x42; break;     // F9
            case "F10": scancode = 0x43; break;     // F10
            case "F11": scancode = 0x44; break;     // F11
            case "F12": scancode = 0x45; break;     // F12
            //case 121:
            //    // 0x14, 0xE0, 0x11 ---- ~0xF0, 0x14, 0xE0,~0xF0, 0x11,
            //    if (isDown) {
            //        this.DoScanCodeDown(0xE0);
            //        scancode = 0x11;
            //    }
            //    else {
            //        this.DoScanCodeUp(0x14, false);
            //        this.DoScanCodeUp(0xE0);
            //        scancode = 0x11;
            //    }
            //    this.altGrIsDown = isDown; break;
            //// Second byte for 'AltGr' key
            //case 156:
            //    scancode = 0x11; break;     // LALT
        //switch (keyNum) {
        //    case 2: scancode = 0x66; break;     // Backspace
        //    case 6: scancode = 0x5A; break;     // ENTER
        //    case 18: scancode = 0x29; break;     // SPACE
        //    case 24: scancode = 0x175; break;     // UP
        //    case 26: scancode = 0x172; break;     // DOWN
        //    case 23: scancode = 0x16B; break;     // LEFT
        //    case 25: scancode = 0x174; break;     // RIGHT
        //    case 74: case 75: case 76: case 77: case 78: case 79: case 80: case 81: case 82: case 83:     // NumPad 1 - 9
        //        scancode = this.DoNum(kk3, isDown) ?? -1; break;
        //    case 119: scancode = 0x114; this.ctrlIsDown = isDown; break;     // RCTRL
        //    case 117: scancode = 89; this.shiftIsDown = isDown; break;   // RSHIFT
        //    case 116: scancode = 0x12; this.shiftIsDown = isDown; break;     // LSHIFT
        //    case 118: scancode = 0x14; this.ctrlIsDown = isDown; break;     // LCTRL
        //    case 121:
        //        // 0x14, 0xE0, 0x11 ---- ~0xF0, 0x14, 0xE0,~0xF0, 0x11,
        //        if (isDown) {
        //            this.DoScanCodeDown(0xE0);
        //            scancode = 0x11;
        //        }
        //        else {
        //            this.DoScanCodeUp(0x14, false);
        //            this.DoScanCodeUp(0xE0);
        //            scancode = 0x11;
        //        }
        //        this.altGrIsDown = isDown; break;
        //    // Second byte for 'AltGr' key
        //    case 156:
        //        scancode = 0x11; break;     // LALT
        }

        return scancode;
    }

    private DoNum(key: string, isDown: boolean) {
        var mapping = this.keyMappingsAzertyBE.find(m => m.Source == key);
        if (mapping == null) return;
        // 0x59 , 0x16
        if (isDown) {
            this.DoScanCodeDown(mapping.Modifier);
            return mapping.TheChar;
        }
        else {
            //DoScanCodeUp(mapping.TheChar, false);
            return mapping.Modifier;
        }
    }

    public SetClipBoard(text: string) {
        this.lastClipBoardText = text;
    }

    private RunPasteMethod() {

        this.isRunningPasteMethod = true;
        //Task.Run(() => {
        //    Task.Delay(10).Wait();
        if (this.lastClipBoardText != null)
            this.PressText(this.lastClipBoardText);
        this.isRunningPasteMethod = false;
        //});
    }

    public static ServiceName: ServiceName = { Name: "KeyboardManager" };
}