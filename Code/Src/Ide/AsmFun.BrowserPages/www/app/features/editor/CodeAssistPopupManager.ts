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
import { IInterpretLine } from "./data/InterpreterData.js";

export class CodeAssistPopupManager {
   
    private mainData: IMainData;
    private data: ICodeAssistPopupData;
    private allowedChars = 'abcdefghijklmnopqrstuvwxyz';
    private search = "";
    private opcodeManager: OpcodeManager;
    private sourceCodeManager: SourceCodeManager;

    constructor(mainData: IMainData) {
        this.mainData = mainData;
        this.data = mainData.GetUIData(UIDataNameCodeAssist);
        mainData.commandManager.Subscribe2(new KeyboardKeyCommand(), this,(k,e) => this.keyPressed(k,e));
        this.opcodeManager = mainData.container.Resolve<OpcodeManager>(OpcodeManager.ServiceName) ?? new OpcodeManager();
        this.sourceCodeManager = mainData.container.Resolve<SourceCodeManager>(SourceCodeManager.ServiceName) ?? new SourceCodeManager(mainData);
    }

    private keyPressed(keyCommand: KeyboardKeyCommand, evt: ICommandEvent) {
        if (!this.data.IsVisible) {
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
 
    public OpenLabelsAndProperties(posX: number, posY: number, line: IInterpretLine) {
        if (this.sourceCodeManager.Bundle == null) return;
        this.InitPopup(posX, posY);
        this.ExtractSearch(line);
        var labels: ICodeAssistPopupDataItem[] = [];
        this.CreateArray(labels, this.sourceCodeManager.Bundle.LabelManager.GetAll(), e => e.IsLabel = true);
        this.CreateArray(labels, this.sourceCodeManager.Bundle.PropertyManager.GetAll(), e => e.IsProperty = true);
        this.data.Items = labels;
        this.UpdateSelected();
    }

    public OpenOpcodesAndMacros(posX: number, posY: number, line: IInterpretLine) {
        if (this.sourceCodeManager.Bundle == null) return;
        this.InitPopup(posX, posY);
        this.ExtractSearch(line);
        var labels: ICodeAssistPopupDataItem[] = [];
        this.CreateOpcodesArray(labels);
        this.CreateArray(labels, this.sourceCodeManager.Bundle.MacroManager.GetAll(), e => e.IsMacro = true);
        this.data.Items = labels;
        this.UpdateSelected();
    }

    public OpenOpcodeSearch(posX: number, posY: number, line: IInterpretLine) {
        this.InitPopup(posX, posY);
        this.ExtractSearch(line);
        var labels: ICodeAssistPopupDataItem[] = [];
        this.CreateOpcodesArray(labels);
        this.data.Items = labels;
        this.UpdateSelected();
    }

    private InitPopup(posX: number, posY: number,) {
        this.data.IsVisible = true;
        this.data.PosX = (posX - 150) + "px";
        this.data.PosY = (posY - 15) + "px";
        this.data.SelectedIndex = 0;
    }

    private ExtractSearch(line: IInterpretLine) {
        if (line.Opcode == null) {
            // Take the last line text part to search in.
            this.search = line.Parts.length > 0 ? line.Parts[line.Parts.length - 1].Text : "";
        }
        else {
            // Take the last line text part to search in.
            this.search = line.Parts.length > 0 ? line.Parts[line.Parts.length - 1].Text : "";
            this.search = this.search.trim();
            if (this.search[0] == "+") this.search = this.search.substring(1);
        }
    }

    private CreateArray(labels: ICodeAssistPopupDataItem[], newItems: any[], oncreated: (el: ICodeAssistPopupDataItem) => void) {
        var search = this.search;
        var indexOffset: number = labels.length;
        for (var i = 0; i < newItems.length; i++) {
            var label = newItems[i];
            if (search != "" && label.Ui.Name.search(new RegExp(search, "i")) === -1) continue;
            var el: ICodeAssistPopupDataItem = this.CreateItem(i + indexOffset, label.Ui.Name, label.Ui, "");
            oncreated(el);
            labels.push(el);
        }
    }

    private CreateOpcodesArray(labels: ICodeAssistPopupDataItem[]) {
        if (this.opcodeManager == null) return;
        var indexOffset: number = labels.length;
        var allOpcodes = this.opcodeManager.Search(this.search);
        for (var i = 0; i < allOpcodes.length; i++) {
            var opcode = allOpcodes[i];
            var el: ICodeAssistPopupDataItem = this.CreateItem(i + indexOffset, opcode.code, opcode, opcode.html != null ? opcode.html : "");
            labels.push(el);
        }
    }

    private CreateItem(index: number, name: string, uiObj: any, hint: string): ICodeAssistPopupDataItem {
        var el: ICodeAssistPopupDataItem = {
            Name: name.replace(":", "").replace("+", ""),
            Hint: hint,
            Data: uiObj,
            IsSelected: false,
            Select: (el) => { this.Select(el, true); },
            Index: index,
            IsLabel: false,
            IsMacro: false,
            IsProperty: false,
        };
        return el;
    }

    private ScrollToLetter(search: string) {
        var item = this.data.Items.find(x => x.Name.search(new RegExp(search, "i")) > -1);
        if (item == null) return;
        this.Select(item,false);
    }
    public Select(item: ICodeAssistPopupDataItem, withEnter: boolean) {
        this.DeselectPrevious();
        this.data.SelectedIndex = item.Index;
        this.UpdateSelected();
        item.IsSelected = true;
        if (withEnter)
            this.EnterKey();
    }
    public UpdateSelected() {
        var item = this.data.Items[this.data.SelectedIndex];
        if (item == null) return;
        item.IsSelected = true;
        this.data.Selected = item;
        var domEl = document.getElementById('codeAs' + item.Index);
        if (domEl != null)
            domEl.scrollIntoView({ behavior: "smooth", block: "nearest", });
    }

    public EnterKey() {
        if (this.data.Selected == null) return false;
        var name = this.data.Selected.Name;
        // We need to remove the typed search characters depending on interpreter
        var toRemove = this.search;
        var command = new EditorInsertTextCommand(toRemove, name, this.data.Selected);
        if (this.sourceCodeManager.Bundle != null) 
            this.sourceCodeManager.Bundle.Interpreter.PreInsertFromCodeAssist(command)
        this.mainData.commandManager.InvokeCommand(command);
        this.Close();
        return false;
    }

    private Backspace() {
        if (this.search.length === 0) return true;
        this.search = this.search.substr(0, this.search.length - 1);
        return true;
    }

    public MoveUp() {
        if (this.data.SelectedIndex == 0) return false;
        this.DeselectPrevious();
        this.data.SelectedIndex--;
        this.UpdateSelected();
        return false;
    }
    public MoveDown() {
        var wanted = this.data.SelectedIndex + 1;
        if (wanted > this.data.Items.length - 1)
            wanted = this.data.Items.length - 1;
        this.DeselectPrevious();
        this.data.SelectedIndex = wanted;
        this.UpdateSelected();
        return false;
    }
    
   
    public PageUp() {
        this.DeselectPrevious();
        var wanted = this.data.SelectedIndex - 8;
        if (wanted < 0)
            wanted = 0;
        this.data.SelectedIndex = wanted;
        this.UpdateSelected();
        return false;
    }
    public PageDown() {
        this.DeselectPrevious();
        var wanted = this.data.SelectedIndex + 8;
        if (wanted > this.data.Items.length-1)
            wanted = this.data.Items.length -1;
        this.data.SelectedIndex = wanted;
        this.UpdateSelected();
        return false;
    }
    public MoveEnd() {
        this.DeselectPrevious();
        this.data.SelectedIndex = this.data.Items.length;
        this.UpdateSelected();
        return false;
    }
    public MoveHome() {
        this.DeselectPrevious();
        this.data.SelectedIndex = 0;
        this.UpdateSelected();
        return false;
    }
   
    public EscapeKey() {
        this.Close();
        return false;
    }

    public Close() {
        this.data.IsVisible = false;
        this.mainData.commandManager.InvokeCommand(new CloseEditorCodeAssistCommand());
    }

    private DeselectPrevious() {
        var lbl = this.data.Items[this.data.SelectedIndex];
        if (lbl != null) {
            lbl.IsSelected = false;
            this.data.Selected = null;
        }
    }

    public GetVisibility() {
        return this.data.IsVisible;
    }

    public static NewData(): ICodeAssistPopupData {
        return {
            Items: [],
            IsVisible: false,
            PosX: "0px",
            PosY: "0px",
            SelectedIndex: 0,

        }; 
    }

    public static ServiceName: ServiceName = { Name: "CodeAssistPopupManager" };
}