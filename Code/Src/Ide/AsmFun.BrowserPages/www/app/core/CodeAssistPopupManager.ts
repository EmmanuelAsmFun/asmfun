// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { IMainData } from "../data/MainData.js";
import { ICodeAssistPopupData, ICodeAssistPopupDataItem } from "../data/ICodeAssistPopupData.js";
import { KeyboardKeyCommand, CloseEditorCodeAssistCommand, EditorInsertTextCommand } from "../data/commands/EditorCommands.js";
import { ICommandEvent } from "../framework/ICommandManager.js";
import { IEditorLine, ICodeBlockContext, IEditorLabel } from "../data/EditorData.js";
import { OpcodeManager } from './OpcodeManager.js';
import { ServiceName } from "../serviceLoc/ServiceName.js";

export class CodeAssistPopupManager {
    private mainData: IMainData;
    private data: ICodeAssistPopupData;
    private allowedChars = 'abcdefghijklmnopqrstuvwxyz';
    private search = "";
    private isMacroSearch: boolean = false;
    private isOpcodeSearch: boolean = false;
    private opcodeManager: OpcodeManager;

    constructor(mainData: IMainData) {
        this.mainData = mainData;
        this.data = mainData.appData.codeAssistPopupData;
        mainData.commandManager.SubscribeAt(0, new KeyboardKeyCommand().GetType(), this, this.keyPressed);
        this.opcodeManager = mainData.container.Resolve<OpcodeManager>(OpcodeManager.ServiceName) ?? new OpcodeManager();
    }

    private keyPressed(keyCommand: KeyboardKeyCommand, evt: ICommandEvent) {
        if (!this.data.isVisible) {
            keyCommand.allowContinueEmit = keyCommand.allowContinueEmit;
            return;
        }
        var allowContinueEmit = true;
        switch (keyCommand.which) {
            case 38: allowContinueEmit = this.MoveUp(); break;      // Up
            case 40: allowContinueEmit = this.MoveDown(); break;    // Down
            case 33: allowContinueEmit = this.PageUp(); break;     // End
            case 34: allowContinueEmit = this.PageDown(); break;     // End
            case 35: allowContinueEmit = this.MoveEnd(); break;     // End
            case 36: allowContinueEmit = this.MoveHome(); break;    // Home
            case 13: allowContinueEmit = this.EnterKey(); break;   // EnterKey
            case 27: allowContinueEmit = this.EscapeKey(); break;   // Escape
            case  8: allowContinueEmit = this.Backspace(); break;    // Backspace
        }
        if (this.allowedChars.indexOf(keyCommand.key) > -1) {
            this.search += keyCommand.key;
            this.search = this.search.trim();
            this.ScrollToLetter(this.search);
            allowContinueEmit = true;
        }
        keyCommand.allowContinueEmit = allowContinueEmit;
    }
 
    public OpenLabelSearch(posX: number, posY: number, line: IEditorLine) {
        this.isMacroSearch = false;
        this.isOpcodeSearch = false;
        this.Init(posX, posY,line);
        this.UpdateLabels(this.search);
        this.UpdateSelected();
    }

    public OpenOpcodeSearch(posX: number, posY: number, line: IEditorLine) {
        this.isMacroSearch = false;
        this.isOpcodeSearch = true;
        this.Init(posX, posY,line);
        this.UpdateOpcodes(this.search);
        this.UpdateSelected();
    }

    public OpenMacroSearch(posX: number, posY: number, line: IEditorLine) {
        this.isMacroSearch = true;
        this.isOpcodeSearch = false;
        this.Init(posX, posY,line);
        this.UpdateMacros(this.search);
        this.UpdateSelected();
    }

    public Init(posX: number, posY: number, line: IEditorLine) {
        this.data.isVisible = true;
        this.data.posX = (posX - 150) + "px";
        this.data.posY = (posY - 15) + "px";
        this.data.selectedIndex = 0;
        var lineData = line.dataCode != null ? line.dataCode.trim() : "";
        if (lineData.length > 0 && lineData[0] == "+") lineData = lineData.substring(1);
        this.search = lineData.trim();
    }

    private UpdateLabels(search: string) {
        var thiss = this;
        if (this.mainData.sourceCode == null || this.mainData.sourceCode.labels == null) return;
        var labels: ICodeAssistPopupDataItem[] = [];
        for (var i = 0; i < this.mainData.sourceCode.labels.length; i++) {
            var label = this.mainData.sourceCode.labels[i];
            if (search != "" && label.data.name.search(new RegExp(search, "i")) === -1) continue;
            var el: ICodeAssistPopupDataItem = {
                data: label,
                name: label.data.name,
                hint: "",
                isSelected: false,
                select: (el) => { thiss.Select(el, true); },
                index: i,
            }
            labels.push(el);
        }
        this.data.items = labels;
    }

    private UpdateOpcodes(search: string) {
        var thiss = this;
        if (this.opcodeManager == null) return;
        var allOpcodes = this.opcodeManager.Search(search);
        var labels: ICodeAssistPopupDataItem[] = [];
        for (var i = 0; i < allOpcodes.length; i++) {
            var opcode = allOpcodes[i];
            var el: ICodeAssistPopupDataItem = {
                data: opcode,
                name: opcode.code,
                hint: opcode.html != null ? opcode.html:"",
                isSelected: false,
                select: (el) => { thiss.Select(el, true); },
                index: i,
            }
            labels.push(el);
        }
        this.data.items = labels;
    }

    private UpdateMacros(search: string) {
        var thiss = this;
        if (this.mainData.sourceCode == null || this.mainData.sourceCode.macros == null) return;
        var macros: ICodeAssistPopupDataItem[] = [];
        for (var i = 0; i < this.mainData.sourceCode.macros.length; i++) {
            var macro = this.mainData.sourceCode.macros[i];
            if (search != "" && macro.name.search(new RegExp(search, "i")) === -1) continue;
            var el: ICodeAssistPopupDataItem = {
                data: macro,
                name: macro.name,
                hint:"",
                isSelected: false,
                select: (el) => { thiss.Select(el, true); },
                index: i,
            }
            macros.push(el);
        }
        this.data.items = macros;
    }

    private ScrollToLetter(search: string) {
        var item = this.data.items.find(x => x.name.search(new RegExp(search, "i")) > -1);
        if (item == null) return;
        this.Select(item,false);
    }
    public Select(item: ICodeAssistPopupDataItem, withEnter: boolean) {
        this.DeselectPrevious();
        this.data.selectedIndex = item.index;
        this.UpdateSelected();
        item.isSelected = true;
        if (withEnter)
            this.EnterKey();
    }
    public UpdateSelected() {
        var item = this.data.items[this.data.selectedIndex];
        if (item == null) return;
        item.isSelected = true;
        this.data.selected = item;
        var domEl = document.getElementById('codeAs' + item.index);
        if (domEl != null)
            domEl.scrollIntoView({ behavior: "smooth", block: "nearest", });
    }

    private Backspace() {
        if (this.search.length === 0) return true;
        this.search = this.search.substr(0, this.search.length - 1);
        return true;
    }

    public MoveUp() {
        if (this.data.selectedIndex == 0) return false;
        this.DeselectPrevious();
        this.data.selectedIndex--;
        this.UpdateSelected();
        return false;
    }
    public MoveDown() {
        var wanted = this.data.selectedIndex + 1;
        if (wanted > this.data.items.length - 1)
            wanted = this.data.items.length - 1;
        this.DeselectPrevious();
        this.data.selectedIndex = wanted;
        this.UpdateSelected();
        return false;
    }
    
   
    public PageUp() {
        this.DeselectPrevious();
        var wanted = this.data.selectedIndex - 8;
        if (wanted < 0)
            wanted = 0;
        this.data.selectedIndex = wanted;
        this.UpdateSelected();
        return false;
    }
    public PageDown() {
        this.DeselectPrevious();
        var wanted = this.data.selectedIndex + 8;
        if (wanted > this.data.items.length-1)
            wanted = this.data.items.length -1;
        this.data.selectedIndex = wanted;
        this.UpdateSelected();
        return false;
    }
    public MoveEnd() {
        this.DeselectPrevious();
        this.data.selectedIndex = this.data.items.length;
        this.UpdateSelected();
        return false;
    }
    public MoveHome() {
        this.DeselectPrevious();
        this.data.selectedIndex = 0;
        this.UpdateSelected();
        return false;
    }
    public EnterKey() {
        if (this.data.selected == null) return false;
        var name = this.data.selected.name;
        var toRemove = this.search;
        if (this.isMacroSearch) {
            toRemove = "+" + toRemove;
            name = "+" + name;
        }
        this.mainData.commandManager.InvokeCommand(new EditorInsertTextCommand(toRemove, name));
        this.Close();
        return false;
    }
    public EscapeKey() {
        this.Close();
        return false;
    }

    public Close() {
        this.data.isVisible = false;
        this.mainData.commandManager.InvokeCommand(new CloseEditorCodeAssistCommand());
    }

    private DeselectPrevious() {
        var lbl = this.data.items[this.data.selectedIndex];
        if (lbl != null) {
            lbl.isSelected = false;
            this.data.selected = null;
        }
    }

    public static NewData(): ICodeAssistPopupData {
        return {
            items: [],
            isVisible: false,
            posX: "0px",
            posY: "0px",
            selectedIndex: 0,

        }; 
    }

    public static ServiceName: ServiceName = { Name: "CodeAssistPopupManager" };
}