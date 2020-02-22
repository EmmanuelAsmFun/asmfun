// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { ICodeAssistPopupData, ICodeAssistPopupDataItem } from "./data/ICodeAssistPopupData.js";
import { KeyboardKeyCommand, CloseEditorCodeAssistCommand, EditorInsertTextCommand } from "./commands/EditorCommands.js";
import { OpcodeManager } from './OpcodeManager.js';
import { IMainData } from "../../framework/data/MainData.js";
import { ICommandEvent } from "../../framework/ICommandManager.js";
import { IEditorLine, IEditorManagerData } from "./data/EditorData.js";
import { ServiceName } from "../../framework/serviceLoc/ServiceName.js";
import { UIDataNameCodeAssist, UIDataNameEditor } from "./EditorFactory.js";
import { SourceCodeManager } from "./SourceCodeManager.js";

export class CodeAssistPopupManager {
   
    private mainData: IMainData;
    private data: ICodeAssistPopupData;
    private editorData: IEditorManagerData;
    private allowedChars = 'abcdefghijklmnopqrstuvwxyz';
    private search = "";
    private isMacroSearch: boolean = false;
    private isOpcodeSearch: boolean = false;
    private opcodeManager: OpcodeManager;
    private sourceCodeManager: SourceCodeManager;

    constructor(mainData: IMainData) {
        this.mainData = mainData;
        this.data = mainData.GetUIData(UIDataNameCodeAssist);
        this.editorData = mainData.GetUIData(UIDataNameEditor);
        mainData.commandManager.Subscribe2(new KeyboardKeyCommand(), this,(k,e) => this.keyPressed(k,e));
        this.opcodeManager = mainData.container.Resolve<OpcodeManager>(OpcodeManager.ServiceName) ?? new OpcodeManager();
        this.sourceCodeManager = mainData.container.Resolve<SourceCodeManager>(SourceCodeManager.ServiceName) ?? new SourceCodeManager(mainData);
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
            case 33: allowContinueEmit = this.PageUp(); break;      // End
            case 34: allowContinueEmit = this.PageDown(); break;    // End
            case 35: allowContinueEmit = this.MoveEnd(); break;     // End
            case 36: allowContinueEmit = this.MoveHome(); break;    // Home
            case 13: allowContinueEmit = this.EnterKey(); break;    // EnterKey
            case 27: allowContinueEmit = this.EscapeKey(); break;   // Escape
            case  8: allowContinueEmit = this.Backspace(); break;   // Backspace
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
        if (this.sourceCodeManager.Bundle == null) return;
        var thiss = this;
        var labelsSrc = this.sourceCodeManager.Bundle.LabelManager.GetAll();
        var varsSrc = this.sourceCodeManager.Bundle.PropertyManager.GetAll();
        var allLabelsSrc = [...labelsSrc, ...varsSrc];
        var labels: ICodeAssistPopupDataItem[] = [];
        for (var i = 0; i < allLabelsSrc.length; i++) {
            var label = allLabelsSrc[i];
            if (search != "" && label.Ui.Name.search(new RegExp(search, "i")) === -1) continue;
            var el: ICodeAssistPopupDataItem = {
                data: label.Ui,
                name: label.Ui.Name,
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
        if (this.sourceCodeManager.Bundle == null) return;
        var macrosSrc = this.sourceCodeManager.Bundle.MacroManager.GetAll();
        var macros: ICodeAssistPopupDataItem[] = [];
        for (var i = 0; i < macrosSrc.length; i++) {
            var macro = macrosSrc[i];
            if (search != "" && macro.Ui.Name.search(new RegExp(search, "i")) === -1) continue;
            var el: ICodeAssistPopupDataItem = {
                data: macro.Ui,
                name: macro.Ui.Name,
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

    public GetVisibility() {
        return this.data.isVisible;
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