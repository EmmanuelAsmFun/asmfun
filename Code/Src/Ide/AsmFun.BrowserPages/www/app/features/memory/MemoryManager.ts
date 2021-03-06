// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IMemoryBlock, IMemoryBlockItem, IMemoryViewerData } from "./data/MemoryData.js";
import {
    MemoryOpenManagerCommand, MemoryScrollCommand, MemoryNextPageCommand, MemoryPreviousPageCommand, MemoryItemHoverCommand, MemorySelectPageCommand,
    MemoryEditCommand
} from "./commands/MemoryCommands.js";
import { EditorManager } from "../editor/EditorManager.js";
import { EditorEnableCommand } from "../editor/commands/EditorCommands.js";
import { ServiceName } from "../../framework/serviceLoc/ServiceName.js";
import { IMainData } from "../../framework/data/MainData.js";
import { DebuggerService } from "../processor/services/DebuggerService.js";
import { AsmTools } from "../../Tools.js";
import { UIDataNameMemory } from "./MemoryFactory.js";
import { SourceCodeManager } from "../editor/SourceCodeManager.js";
import { ILabelManager } from "../editor/data/ILabelManager.js";
import { LabelManager } from "../editor/LabelManager.js";
import { PropertyManager } from "../editor/PropertyManager.js";
import { IPropertyManager } from "../editor/data/IPropertyManager.js";
import { ZoneManager } from "../editor/ZoneManager.js";
import { IZoneManager } from "../editor/data/IZoneManager.js";
import { IInterpretLine } from "../editor/data/InterpreterData.js";
import { IdeSelectCodeNavTabCommand } from "../player/commands/ASMFunPlayerManagerCommands.js";


export class MemoryManager {
   
    private autoReloadRef = -1;
    private memData: string = "";
    private debuggerService: DebuggerService;
    private editorManager: EditorManager;
    private sourceCodeManager: SourceCodeManager;
    private mainData: IMainData;
    private data: IMemoryViewerData;
    private pageSize: number = 512;
    private addressStart: number = 0;
    private addressStartEdit: number = 0;
    public currentPage: number = 2048 / (this.pageSize / 2); // = 0x0800 = is start address program
    public totalPages: number = 16 * 16 -2 +500;
    private previousHiliteLabel?:IMemoryBlockItem = undefined;
    private previousCodeGroup?: IMemoryBlockItem[] = undefined;
    private memoryAddressNamesA: number[] = [0x0000, 0x0080, 0x0100, 0x0200, 0x0400, 0x0800, 0x9F00, 0x9F20, 0x9F40, 0x9F60, 0x9F70, 0x9F80, 0x9FA0, 0xA000, 0xC000]
    private memoryAddressNamesB: number[] = [0x007F, 0x00FF, 0x01FF, 0x03FF, 0x07FF, 0x9EFF, 0x9F1F, 0x9F3F, 0x9F5F, 0x9F6F, 0x9F7F, 0x9F9F, 0x9FFF, 0xBFFF, 0xFFFF]
    private memoryAddressNames: string[] = ["User zero page", "KERNAL and BASIC zero page variables", "CPU stack", "KERNAL and BASIC variables, vectors",
        "Available for code programs or storage", "BASIC program/variables available to the user",
        "Reserved for audio controller", "VERA video controller", "Reserved", "VIA I/O controller #1", "VIA I/O controller #2", "Real time clock", "Future Expansion",
        "RAM Banks", "ROM Banks"
    ]
    private addressParts = [
        { address: 0x3E3, length: 2, name: "Start program address + file length" }
    ];


    constructor(mainData: IMainData) {
        this.mainData = mainData;
        this.data = mainData.GetUIData(UIDataNameMemory);
        this.debuggerService = mainData.container.Resolve<DebuggerService>(DebuggerService.ServiceName) ?? new DebuggerService(mainData);
        this.editorManager = mainData.container.Resolve<EditorManager>(EditorManager.ServiceName) ?? new EditorManager(mainData);
        this.sourceCodeManager = mainData.container.Resolve<SourceCodeManager>(SourceCodeManager.ServiceName) ?? new SourceCodeManager(mainData);
        this.mainData.commandManager.Subscribe2(new MemoryOpenManagerCommand(null), this, x => this.OpenManager(x.state));
        this.mainData.commandManager.Subscribe2(new MemoryScrollCommand(0), this, x => this.Scroll(x.deltaY));
        this.mainData.commandManager.Subscribe2(new MemoryNextPageCommand(0), this, x => this.NextPage(x.factor));
        this.mainData.commandManager.Subscribe2(new MemoryPreviousPageCommand(0), this, x => this.PreviousPage(x.factor));
        this.mainData.commandManager.Subscribe2(new MemorySelectPageCommand(0), this, x => this.SelectPageByAddress(x.startAddress));
        this.mainData.commandManager.Subscribe2(new MemoryItemHoverCommand(0, 0, 0), this, x => this.MemoryItemHover(x.index, x.address, x.value));
        this.mainData.commandManager.Subscribe2(new MemoryEditCommand(0), this, x => this.MemoryEdit(x.address, x.element));
        for (var i = 0; i < this.memoryAddressNames.length; i++) {
            this.data.addressNames.push({
                startAddress: this.memoryAddressNamesA[i],
                startAddressHex: AsmTools.numToHex4(this.memoryAddressNamesA[i]),
                endAddress: this.memoryAddressNamesB[i],
                endAddressHex: AsmTools.numToHex4(this.memoryAddressNamesB[i]),
                name : this.memoryAddressNames[i],
            });
        }
        this.data.swapShowTOC = () => this.data.showTOC = !this.data.showTOC;
        this.data.memoryEditText = "hallo";
        this.data.memoryEditKeyUp = (evt) => {
            if (evt.which === 13) {
                // ENTER
                this.data.isMemoryEditing = false;
                var txt = this.data.memoryEditText;
                var bytes = txt.replace(/|/g, "").replace(/  /g, " ").split(' ').map(x => parseInt(x,16));
                this.debuggerService.WriteMemoryBlock(this.addressStartEdit, bytes, bytes.length, () => {
                    this.getMemoryBlock(this.currentPage * this.pageSize / 2, this.pageSize);
                });
                this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(true));
            }
            else if (evt.which === 27) {
                // ESC
                this.data.isMemoryEditing = false;
                this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(true));
            }
            return true;
        };
        this.data.swapAutoReload = () => {
            this.data.autoReload = !this.data.autoReload;
            if (this.data.autoReload) {
                clearInterval(this.autoReloadRef);
                this.autoReloadRef = setInterval(() => this.SelectPageByAddress(-1), 1000);
            } else {
                clearInterval(this.autoReloadRef);
            }
        }
    }

    private OpenManager(state: boolean | null) {
        if (state == null)
            state = !this.data.isVisible;
        if (state === this.data.isVisible) return;
        if (!state)
            this.Close();
        else
            this.Open(() => { });
    }

    private Open(doneMethod:(r0:IMemoryBlock) => void){
        this.getMemoryBlock(this.currentPage * this.pageSize/2, this.pageSize,doneMethod);
        this.data.isVisible = true;
    }

    
    private Close(){
        this.DeselectPrevious();
        this.data.isVisible = false;
        this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(true));
    }

    private Scroll(deltaY: number): void {
        if (deltaY > 0)
            this.NextPage(1);
        else
            this.PreviousPage(1);
    }

    private NextPage(factor:number = 1){
        var wantedCurrentPage = this.currentPage + factor;
        if (wantedCurrentPage > this.totalPages)
            wantedCurrentPage = this.totalPages;
        this.currentPage = wantedCurrentPage;
        this.getMemoryBlock(this.currentPage * this.pageSize/2, this.pageSize);
    }
    private PreviousPage(factor: number = 1) {
        var wantedCurrentPage = this.currentPage - factor;
        if (wantedCurrentPage < 0) wantedCurrentPage = 0;
        this.currentPage = wantedCurrentPage;
        this.getMemoryBlock(this.currentPage * this.pageSize/2, this.pageSize);
    }
    private SelectPageByAddress(startAddress: number): void {
        if (startAddress >= 0) {
            var page = Math.floor(startAddress / (this.pageSize / 2));
            if (page < 0) page = 0;
            this.currentPage = page;
        }
        this.getMemoryBlock(this.currentPage * this.pageSize / 2, this.pageSize);
        this.data.showTOC = false;
    }


    private getMemoryBlock(startAddress: number, count: number,doneMethod?: (r0:IMemoryBlock) => void) {
        var thiss = this;
        this.data.isMemoryEditing = false;
        this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(true));
        this.debuggerService.getMemoryBlock(startAddress,count,(memBlock:IMemoryBlock) => {
            if (memBlock == null || memBlock.data == null) return;
            this.addressStart = startAddress;
            var lblManager: ILabelManager = this.sourceCodeManager.Bundle != null ? this.sourceCodeManager.Bundle.LabelManager : new LabelManager();
            var varManager: IPropertyManager = this.sourceCodeManager.Bundle != null ? this.sourceCodeManager.Bundle.PropertyManager : new PropertyManager();
            var zoneManager: IZoneManager = this.sourceCodeManager.Bundle != null ? this.sourceCodeManager.Bundle.ZoneManager : new ZoneManager();
            //var labels = this.editorData.labels;
            var startText = "<span class=\"addr\" onclick=\"MemoryEdit(" + (startAddress) +",this)\">"+AsmTools.numToHex4(startAddress)+"</span>&nbsp;";
            var lineString = "";
            memBlock.datas = [];
            const binary_string = window.atob(memBlock.data);
            this.memData = binary_string;
            var totalAddress = 0;
            var groupp:IMemoryBlockItem[] = [];
            
            // make a smaller sourcode list, with only used addresses
            var sourceCodeLinesCache: IInterpretLine[] = []
            if (this.sourceCodeManager.Bundle != null) {
                var files = this.sourceCodeManager.Bundle.Files;
                for (let i = 0; i < files.length; i++) {
                    const file = files[i];
                    for (let j = 0; j < file.Lines.length; j++) {
                        var line = file.Lines[j];
                        var addressNum = line.AddressNum;
                        if (addressNum ===0) continue;
                        if (addressNum>= startAddress && addressNum <= startAddress + count) {  
                            sourceCodeLinesCache.push(file.Lines[j]);
                             if (addressNum > startAddress + count)
                                 break;
                          }
                    }
                }
            }

            for (let index = 0; index < memBlock.count; index++) {
                const element = binary_string.charCodeAt(index);
                const addr=index + startAddress;
                lineString += AsmTools.numToStringChar(element);
                var addressTitle = "";
                var addressTitleInner = "<br />";
                var addEnter = "<br />";
                var lineResult = "";
                var addressNameIndexPre = this.memoryAddressNamesA.indexOf(addr);
                var addressNameIndex = this.memoryAddressNamesA.indexOf(addr+1);
                if (addressNameIndex > -1) {
                    addressTitleInner = "<br /><br /><div class=\"addrtname\">" + this.memoryAddressNames[addressNameIndex] + "</div>";
                    addEnter = "";
                }
                if (addressNameIndexPre > -1 && index ==0)
                    addressTitle = "<br /><div class=\"addrtname\">" + this.memoryAddressNames[addressNameIndexPre] + "</div>";

                
                if ((index +1)%8 ==0) lineResult = "&nbsp;";
                if ((index + 1) % 16 == 0) {
                    lineResult = "&nbsp;" + lineString + addressTitleInner;
                    lineString = "";
                }
                if ((index + 1) % 128 == 0) {
                    lineResult += addEnter + "<span class=\"addr\" onclick=\"MemoryEdit(" + (addr + 1) +",this)\">" + AsmTools.numToHex4(addr + 1) + "&nbsp;</span>";
                }
                else if (((index + 1) % 16 == 0)) lineResult += "<span class=\"addr\" onclick=\"MemoryEdit(" + (addr + 1) +",this)\">"
                    + AsmTools.numToHex4(addr + 1) + "&nbsp;</span>";


                let txt = addressTitle + startText + "<span class=\"memItm\" onmouseover=\"MemoryItemHover(" + index + "," + addr + "," + element + ")\">"
                    + AsmTools.numToHex2(element) + '&nbsp;</span>' + lineResult;
                startText = "";

                var item:IMemoryBlockItem = {
                    code:txt,
                    hilite:false,
                    group: groupp,
                    isLabel: false,
                    isSc: false,
                    isZone: false,
                    isVariable: false,
                    isStart: false,
                };
                
                memBlock.datas.push(item);
                // Check if it's a label
                var found = lblManager.FindByAddress(addr);
                if (found != null){
                    groupp = [];
                    item.isLabel = true;
                    item.label = found.Ui;
                    item.isZone = true;
                    item.isVariable = false;
                    totalAddress = 0;
                    continue;
                }
                var foundVar = varManager.FindByAddress(addr);
                if (foundVar != null){
                    groupp = [];
                    item.isLabel = true;
                    item.label = foundVar.Ui;
                    item.isZone = false;
                    item.isVariable = true;
                    totalAddress = 0;
                    continue;
                }
                
                // check if it isn't from a sourcecode group
                if (groupp.length > 0) {
                    if (totalAddress > 1) {
                        // it's a second element in the group
                        totalAddress --;
                        groupp.push(item);
                        // Parse the sourcecode from the first item in the group.
                        item.sourceCodeLine =  groupp[0].sourceCodeLine;
                        item.isSc = true;
                        // we don't need to continue, because we know it's a sourcecode.
                        continue;
                    }
                }
                groupp = [];
                item.group = groupp;
                 // Try to find the address in sourceCode
                var foundSc = sourceCodeLinesCache.find(x => x.AddressNum === addr);
                if (foundSc != null) {
                    // Found
                    groupp.push(item);
                    item.sourceCodeLine = foundSc.EditorLine.Ui;
                    item.isSc = true;
                    item.isStart = true;
                    // Remove all previous addresses because they cannot be used anymore
                    var indexLine = sourceCodeLinesCache.indexOf(foundSc);
                    //sourceCodeLinesCache = sourceCodeLinesCache.splice(0,indexLine);
                    // Found address, get number of bytes
                    totalAddress = 1;
                    if(indexLine +1 < sourceCodeLinesCache.length) {
                        var currentAdd = AsmTools.hexToNum(foundSc.Ui.Address);
                        for (let k = 1; k < 50; k++) {
                            var nextLineAddress = sourceCodeLinesCache[indexLine + k].Ui.Address;
                            if (nextLineAddress != null &&  nextLineAddress !== "") {
                                totalAddress = AsmTools.hexToNum(nextLineAddress) -  currentAdd;
                                break;
                            }
                        }
                    }
                }

                startText = "";
            }
            memBlock.startAddressHex = "0x"+AsmTools.numToHex4(startAddress);
            memBlock.endAddressHex = "0x" + AsmTools.numToHex4(startAddress + memBlock.count);
            memBlock.currentPage = this.currentPage;
            memBlock.totalPages = this.totalPages;
            thiss.data.memoryBlock = memBlock;
            if (doneMethod != null)
                doneMethod(memBlock);
        })
    }

    private DeselectPrevious(){
        if (this.previousCodeGroup != null) {
            for (let j = 0; j < this.previousCodeGroup.length; j++) 
                this.previousCodeGroup[j].hilite = false;
        }
        if (this.previousHiliteLabel != null) {
            this.previousHiliteLabel.hilite = false;
            if (this.previousHiliteLabel.label != null)
                this.previousHiliteLabel.label.Hilite = false;
        }
    }
    private ScollToElement(el: HTMLElement | null) {
        if (el == null) return;
        //console.log("scroll to " + el.id);
        el.scrollIntoView({ behavior: "smooth", block: "start", });
        setTimeout(() => {
            if (el != null)
                el.scrollIntoView({ behavior: "auto", block: "start", });
        }, 300);
    }

    private MemoryItemHover(index: number, address: number, value:number)
    {
        // Deselect previous
        this.DeselectPrevious();
        const item =  this.data.memoryBlock.datas[index];
        // Try to find in labels
        if (item.isLabel && item.label != null) {
            this.data.HiliteSourceCode = true;
            this.editorManager.SelectFileByIndex(item.label.FileIndex);
            item.hilite = true;
            item.label.Hilite = true;
            this.previousHiliteLabel = item;
            this.mainData.commandManager.InvokeCommand(new IdeSelectCodeNavTabCommand(item.isVariable ? "Variables" : "Labels"));
            setTimeout(() => {
                if (item.label == null) return;
                var elVar = item.isVariable ?
                    document.getElementById('varview' + item.label.Name) :
                    document.getElementById('lblview' + item.label.Name);
                if (elVar != null)
                    elVar.scrollIntoView();
            }, 100);
            if (item.label.LineNumber > 0) {
                var el = document.getElementById('line' + (item.label.LineNumber - 3));
                this.ScollToElement(el);
            }
            return;
        }

        var sourceCode = this.sourceCodeManager.GetEditorBundle();
        if (sourceCode != null) {
            this.data.HiliteSourceCode = true;
            if (item.group.length > 0){
                for (let i = 0; i < item.group.length; i++) {
                    const element = item.group[i];
                    element.hilite = true;
                }
                this.previousCodeGroup = item.group;
            }else {
                item.hilite = true;
                this.previousCodeGroup = [item];
               
            }
            if (item.sourceCodeLine != null) {
                this.editorManager.SelectFileByIndex(item.sourceCodeLine.FileIndex);
                var el = document.getElementById('line' + (item.sourceCodeLine.LineNumber - 3));
                this.ScollToElement(el);
            }
            else {
                this.data.HiliteSourceCode = false;
            }
            return;
        }
        this.data.HiliteSourceCode = false;
    }

    private MemoryEdit(address: number, element?: HTMLElement) {
        this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(false));
        this.data.isMemoryEditing = true;
        this.addressStartEdit = address;
        var indexStart = address - this.addressStart;
        if (indexStart < 0) indexStart = address;
        var index = indexStart;
        var txt = "";
        for (var i = 0; i < 16; i++) {
            const element = this.memData.charCodeAt(index + i);
            txt += " " + AsmTools.numToHex2(element);
            if ((i + 1 )% 8 === 0) txt += " ";
        }
        this.data.memoryEditText = txt.trim().substr(0,(16*3 +2));
        if (element != null) {
            this.data.memoryEditYOffset = element.offsetTop;
        }
    }

    

    public static NewData(): IMemoryViewerData {
        return {
            isVisible: false,
            memoryBlock: MemoryManager.NewMemoryBlock(),
            addressNames: [],
            showTOC: false,
            swapShowTOC: () => { },
            memoryEditText: "",
            memoryEditYOffset:0,
            memoryEditKeyUp: () => { },
            isMemoryEditing: false,
            HiliteSourceCode: false,
            autoReload: false,
            swapAutoReload: () => { }
        };
    }

    public static NewMemoryBlock() {
        return {
            count: 0,
            data: "",
            datas: [],
            startAddress: 0,
            startAddressHex: "0x0000",
            endAddressHex: "0x0000",
            currentPage: 0,
            totalPages: 0
        };
    }


    public static ServiceName: ServiceName = { Name: "MemoryManager" };
}