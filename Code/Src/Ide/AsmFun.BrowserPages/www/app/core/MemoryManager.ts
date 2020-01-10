// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { DebuggerService } from "../services/DebuggerService.js";
import { AsmTools } from "../Tools.js"
import { IAsmFunAppData } from "../data/AsmFunAppData.js"
import { IMainData } from "../data/MainData.js";
import { IMemoryBlock, IMemoryBlockItem, IMemoryViewerData } from "../data/MemoryData.js";
import { IEditorLine, IEditorLabel } from "../data/EditorData.js";
import { MemoryOpenManagerCommand, MemoryScrollCommand, MemoryNextPageCommand, MemoryPreviousPageCommand, MemoryItemHoverCommand, MemorySelectPageCommand, MemoryEditCommand } from "../data/commands/MemoryCommands.js";
import { ServiceName } from "../serviceLoc/ServiceName.js";
import { EditorManager } from "./EditorManager.js";
import { EditorEnableCommand } from "../data/commands/EditorCommands.js";


export class MemoryManager {
   
   
    private memData: string = "";
    private debuggerService: DebuggerService;
    private editorManager: EditorManager;
    private mainData: IMainData;
    private data: IMemoryViewerData;
    private myAppData: IAsmFunAppData;
    private pageSize: number = 512;
    private addressStart: number = 0;
    private addressStartEdit: number = 0;
    public currentPage: number = 2048 / (this.pageSize / 2); // = 0x0800 = is start address program
    public totalPages: number = 16 * 16 -2;
    private previousHiliteLabel?:IMemoryBlockItem = undefined;
    private previousCodeGroup?: IMemoryBlockItem[] = undefined;
    private memoryAddressNamesA: number[] = [0x0000, 0x0080, 0x0100, 0x0200, 0x0400, 0x0800, 0x9F00, 0x9F20, 0x9F40, 0x9F60, 0x9F70, 0x9F80, 0x9FA0]
    private memoryAddressNamesB: number[] = [0x007F, 0x00FF, 0x01FF, 0x03FF, 0x07FF, 0x9EFF, 0x9F1F, 0x9F3F, 0x9F5F, 0x9F6F, 0x9F7F, 0x9F9F, 0x9FFF]
    private memoryAddressNames: string[] = ["User zero page", "KERNAL and BASIC zero page variables", "CPU stack", "KERNAL and BASIC variables, vectors",
        "Available for code programs or storage", "BASIC program/variables available to the user",
        "Reserved for audio controller", "VERA video controller", "Reserved", "VIA I/O controller #1", "VIA I/O controller #2", "Real time clock","Future Expansion"

    ]


    constructor(mainData: IMainData) {
        this.mainData = mainData;
        this.myAppData = mainData.appData;
        this.data = mainData.appData.memoryViewer;
        this.debuggerService = mainData.container.Resolve<DebuggerService>(DebuggerService.ServiceName) ?? new DebuggerService();
        this.editorManager = mainData.container.Resolve<EditorManager>(EditorManager.ServiceName) ?? new EditorManager(mainData);
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
        this.debuggerService.getMemoryBlock(startAddress,count,(memBlock:IMemoryBlock) => {
            if (memBlock == null || memBlock.data == null) return;
            if (this.mainData.sourceCode == null) return;
            this.addressStart = startAddress;
            var labels = this.mainData.sourceCode.labels;
            var startText = "<span class=\"addr\" onclick=\"MemoryEdit(" + (startAddress) +",this)\">"+AsmTools.numToHex4(startAddress)+"</span>&nbsp;";
            var lineString = "";
            memBlock.datas = [];
            const binary_string = window.atob(memBlock.data);
            this.memData = binary_string;
            var totalAddress = 0;
            var groupp:IMemoryBlockItem[] = [];
            
            // make a smaller sourcode list, with only used addresses
            var sourceCodeLinesCache: IEditorLine[] = []
            if (this.mainData.sourceCode != null){
                for (let i = 0; i < this.mainData.sourceCode.files.length; i++) {
                    const file = this.mainData.sourceCode.files[i];
                    for (let j = 0; j < file.lines.length; j++) {
                        var line = file.lines[j];
                        var add = line.data.resultMemoryAddress;
                        if (line.data == null || add == null || add === "") continue;
                        var addressNum = AsmTools.hexToNum(add);
                        if (addressNum>= startAddress && addressNum <= startAddress + count) {  
                            sourceCodeLinesCache.push(file.lines[j]);
                             if (addressNum > startAddress + count)
                                 break;
                          }
                    }
                }
            }
           
            
            for (let index = 0; index < memBlock.count; index++) {
                const element = binary_string.charCodeAt(index);
                const addr=index + startAddress;
                const hexAddress = AsmTools.numToHex4(addr)
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
                if (this.myAppData.labelsWithoutZones != null) {
                    var found = labels.find(x => x.labelhexAddress === hexAddress);
                    if (found != null){
                        groupp = [];
                        item.isLabel = true;
                        item.label = found;
                        item.isZone = found.isZone;
                        item.isVariable = found.isVariable;
                        totalAddress = 0;
                        continue;
                    }
                }
                
                // check if it isn't from a sourcecode group
                if (groupp.length > 0) {
                    if (totalAddress > 1) {
                        // it's a second element in the group
                        totalAddress --;
                        groupp.push(item);
                        // Parse the sourcecode from the first item in the group.
                        item.sourceCodeLine = groupp[0].sourceCodeLine;
                        item.isSc = true;
                        // we don't need to continue, because we know it's a sourcecode.
                        continue;
                    }
                }
                groupp = [];
                item.group = groupp;
                 // Try to find the address in sourceCode
                if (this.mainData.sourceCode != null) {
                    var foundSc = sourceCodeLinesCache.find(x => x.data.resultMemoryAddress === hexAddress);
                    if (foundSc != null) {
                        // Found
                        groupp.push(item);
                        item.sourceCodeLine = foundSc;
                        item.isSc = true;
                        item.isStart = true;
                        // Remove all previous addresses because they cannot be used anymore
                        var indexLine = sourceCodeLinesCache.indexOf(foundSc);
                        //sourceCodeLinesCache = sourceCodeLinesCache.splice(0,indexLine);
                        // Found address, get number of bytes
                        totalAddress = 1;
                        if(indexLine +1 < sourceCodeLinesCache.length) {
                            var currentAdd = AsmTools.hexToNum(foundSc.data.resultMemoryAddress);
                            for (let k = 1; k < 50; k++) {
                                var nextLineAddress = sourceCodeLinesCache[indexLine+k].data.resultMemoryAddress;
                                if (nextLineAddress != null &&  nextLineAddress !== "") {
                                    totalAddress = AsmTools.hexToNum(nextLineAddress) -  currentAdd;
                                    break;
                                }
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
                this.previousHiliteLabel.label.hilite = false;
        }
    }

    private MemoryItemHover(index: number, address: number, value:number)
    {
        // Deselect previous
        this.DeselectPrevious();

        var item =  this.data.memoryBlock.datas[index];
        var hexAddress = AsmTools.numToHex4(address);
        // Try to find in labels
        if (item.isLabel && item.label != null) {
            if (item.label.file != null) {
                this.editorManager.SelectFile(item.label.file);
            }
            item.hilite = true;
            item.label.hilite = true;
            this.previousHiliteLabel = item;
            var el = document.getElementById('lblview'+item.label.data.name);
            if (el != null) 
                el.scrollIntoView({ behavior: "smooth", block: "nearest", });
            
            return;
        }
        
        if (this.mainData.sourceCode != null) {
           
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
            if (item.sourceCodeLine != null)
            {
                //if (item.sourceCodeLine.file != null) {
                //    this.editorManager.SelectFile(item.sourceCodeLine.file);
                //}
                var el = document.getElementById('line'+(item.sourceCodeLine.data.lineNumber-3));
                if (el != null) {
                    el.scrollIntoView({ behavior: "smooth", block: "start", });
                }
            }
            return;
        }
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