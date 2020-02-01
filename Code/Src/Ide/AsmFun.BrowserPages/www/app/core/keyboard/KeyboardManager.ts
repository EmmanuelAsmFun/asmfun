// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IAsmFunAppData } from "../../data/AsmFunAppData.js"
import { IMainData } from "../../data/MainData.js";
import { ServiceName } from "../../serviceLoc/ServiceName.js";
import { ComputerService } from "../../services/ComputerService.js";
import { IKeyboardKey } from "../../data/ComputerData.js";
import { KeyboardMapping } from "./KeyboardMapping.js";
import { UserSettingsLoaded } from "../../data/commands/ProjectsCommands.js";
import { IUserSettings } from "../../data/ProjectData.js";


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
    private keyboardMapping: KeyboardMapping;
    public isEnabled: boolean = false;
    private lastClipBoardText: string | null = null;
    
 

    constructor(mainData: IMainData) {
        var thiss = this;
        this.mainData = mainData;
        this.myAppData = mainData.appData;
        this.computerService = this.mainData.container.Resolve<ComputerService>(ComputerService.ServiceName) ?? new ComputerService(mainData);
        this.keyboardMapping = new KeyboardMapping();
        this.mainData.eventManager.Subscribe2(new UserSettingsLoaded(), this, x => this.UserSettingsLoaded(x.userSettings));
    }


    private UserSettingsLoaded(userSettings: IUserSettings | null) {
        if (userSettings == null || userSettings.computerSettings == null || userSettings.computerSettings.keyMapIndex == null) return;
        this.keyboardMapping.SelectKeyMap(userSettings.computerSettings.keyMapIndex);
    }
  



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

        var mapping = this.keyboardMapping.Get(item);
        if (mapping == null) return;
        if (mapping.Modifier1 == -1) {
            if (mapping.Modifier == -1) {
                this.DoScanCodeDown(mapping.CharNum);
                this.DoScanCodeUp(mapping.CharNum);
            }
            else {
                this.DoScanCodeDown(mapping.Modifier);
                this.DoScanCodeDown(mapping.CharNum);
                this.DoScanCodeUp(mapping.CharNum);
                this.DoScanCodeUp(mapping.Modifier);
            }
        }
        else {
            this.DoScanCodeDown(mapping.Modifier1);
            this.DoScanCodeDown(mapping.Modifier);
            this.DoScanCodeDown(mapping.CharNum);
            this.DoScanCodeUp(mapping.CharNum);
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
        var mapping = this.keyboardMapping.Get(key);
        if (mapping == null) return;
        this.DoScanCodeDown(mapping.CharNum);
    }

    private MappingUp(key: string) {
        var mapping = this.keyboardMapping.Get(key);
        if (mapping == null) return;
        this.DoScanCodeUp(mapping.CharNum);
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
        var scancode = this.keyboardMapping.GetSpecialKey(kk3);
        if (scancode > -1) return scancode;
        switch (kk3) {

            case "1": case "2": case "3": case "4": case "5": case "6": case "7": case "8": case "9": case "0":     // NumPad 1 - 9
                scancode = this.DoNum(kk3, isDown) ?? -1; break;
            case "Control": scancode = 0x114; this.ctrlIsDown = isDown; break;     // RCTRL
            case "Control": scancode = 89; this.shiftIsDown = isDown; break;   // RSHIFT
            case "Shift": scancode = 0x12; this.shiftIsDown = isDown; break;     // LSHIFT
            case "Shift": scancode = 0x14; this.ctrlIsDown = isDown; break;     // LCTRL
        }

        return scancode;
    }

    private DoNum(key: string, isDown: boolean) {
        var mapping = this.keyboardMapping.Get(key);
        if (mapping == null) return;
        // 0x59 , 0x16
        if (isDown) {
            this.DoScanCodeDown(mapping.Modifier);
            return mapping.CharNum;
        }
        else {
            //DoScanCodeUp(mapping.CharNum, false);
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

    public GetAllKeyMaps(): string[] {
        return this.keyboardMapping.KeyMaps;
    }

    public static ServiceName: ServiceName = { Name: "KeyboardManager" };
}