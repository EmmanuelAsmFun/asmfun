// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import {
    ProcessorOpenDebuggerCommand, ProcessorNextStepCommand, ProcessorStepOverCommand, ProcessorDebuggerRunCommand, ProcessorReloadValuesCommand,
    ProcessorDebuggerSetBreakpointCommand,
    ProcessorBreakPointsChanged
} from "./commands/ProcessorCommands.js";
import { IProcessorData, IStackData, IStackItemData, IProcessorManagerData } from "./data/ProcessorData.js";
import { ComputerService } from "../computer/services/ComputerService.js";
import { DebuggerService } from "../processor/services/DebuggerService.js";
import { IAsmFunAppData } from "../player/data/AsmFunAppData.js";
import { IMainData } from "../../framework/data/MainData.js";
import { ComputerResetCommand, ComputerProcessorDataChanged } from "../computer/commands/ComputerCommands.js";
import { IEditorLine, IPropertyData, IEditorLabel, IEditorFile, IEditorManagerData } from "../editor/data/EditorData.js";
import { IDebuggerBreakpoint } from "./data/BreakPointsData.js";
import { AsmTools } from "../../Tools.js";
import { ISourceCodeLabel } from "../project/data/ProjectData.js";
import { EditorManager } from "../editor/EditorManager.js";
import { ServiceName } from "../../framework/serviceLoc/ServiceName.js";
import { UIDataNameProcessor } from "./ProcessorFactory.js";
import { UIDataNameEditor } from "../editor/EditorFactory.js";
import { BreakPointsManager } from "./BreakPointsManager.js";


export class ProcessorManager {
   
    
    private currentLine?: IEditorLine;

    private computerService: ComputerService;
    private debuggerService: DebuggerService;
    private breakPointsManager: BreakPointsManager;
    private mainData: IMainData;
    private data: IProcessorManagerData;
    private editorData: IEditorManagerData;

    constructor(mainData: IMainData) {
        this.mainData = mainData;
        this.data = mainData.GetUIData(UIDataNameProcessor);
        this.editorData = mainData.GetUIData(UIDataNameEditor);
        this.computerService = mainData.container.Resolve<ComputerService>(ComputerService.ServiceName)?? new ComputerService(mainData);
        this.debuggerService = mainData.container.Resolve<DebuggerService>(DebuggerService.ServiceName) ?? new DebuggerService(mainData);
        this.breakPointsManager = mainData.container.Resolve<BreakPointsManager>(BreakPointsManager.ServiceName) ?? new BreakPointsManager(mainData);
        // Subscribe to commands
        this.mainData.commandManager.Subscribe2(new ComputerResetCommand(), this, () => this.ResetEmulator());
        this.mainData.commandManager.Subscribe2(new ProcessorOpenDebuggerCommand(null), this, x => this.OpenManager(x.state));
        this.mainData.commandManager.Subscribe2(new ProcessorNextStepCommand(), this, () => this.NextStep());
        this.mainData.commandManager.Subscribe2(new ProcessorStepOverCommand(), this, () => this.StepOver());
        this.mainData.commandManager.Subscribe2(new ProcessorDebuggerRunCommand(), this, () => this.Run());
        this.mainData.commandManager.Subscribe2(new ProcessorReloadValuesCommand(), this, () => this.LoadLabelValues());
        this.mainData.commandManager.Subscribe2(new ProcessorDebuggerSetBreakpointCommand(null, null), this, (c) => this.SetBreakpointCurrentLine(c.file, c.line));
        // Subscribe to events
        this.mainData.eventManager.Subscribe2(new ComputerProcessorDataChanged(null), this, x => this.parseData6502(x.processorData));
        this.mainData.eventManager.Subscribe2(new ProcessorBreakPointsChanged(null), this, x => this.BreakPointsChanged(x.breakpoints));
    }

    private OpenManager(state: boolean | null) {
        if (state == null)
            state = !this.data.isShowDebugger;
        if (state === this.data.isShowDebugger) return;
        if (!state)
            this.Close();
        else
            this.Open();
    }


    private Open() {
        this.data.isShowDebugger = true;
        if (this.mainData.sourceCode != null) 
            this.breakPointsManager.LoadBreakPoints(this.mainData.sourceCode.files);
    }

    private Close() {
        this.data.isShowDebugger = false;
    }


    private ResetEmulator() {
        var thiss = this;
        setTimeout(() => { thiss.updateAll(); }, 3000);
    }

    public updateProcessorData() {
        this.computerService.GetProcessorData();
    }

    public updateAll() {
        this.reloadStack();
        this.reloaddissasembly();
        this.LoadLabelValues();
    }

    public reloadStack() {
        var thiss = this;
        this.computerService.getStack((r: IStackData) => {
            if (r == null || r.datas == null) return;
            var blocks: IStackItemData[] = [];
            thiss.data.stack = {
                datas: [],
            };
            if (thiss.data.stack.datas == undefined) return;
            var newDatas = r.datas;
            var addBlock = false;
            // remove repeating zeros
            for (var i = 0; i < newDatas.length; i++) {
                var item = newDatas[i];
                if (item.data1 != 0) {
                    addBlock = true;
                }
                blocks.push(item);
                if (i % 8) {
                    if (addBlock) {
                        for (var j = 0; j < blocks.length; j++) {
                            thiss.data.stack.datas.push(blocks[j]);
                        }
                    }
                    blocks = [];
                    addBlock = false;
                }
            }
            if (addBlock) {
                for (var j = 0; j < blocks.length; j++) {
                    thiss.data.stack.datas.push(blocks[j]);
                }
            }
        });
    }
   


    public parseData6502(data: IProcessorData | null) {
        if (data == null) return;
        this.data.data6502 = data;
        if (this.data.dissasembly != null && this.data.dissasembly.datas != null) {
            var found = this.data.dissasembly.datas.find(x => x.address == data.programCounter);
            if (found != null) {
                if (this.mainData.previousSelectedPC != null)
                    this.mainData.previousSelectedPC.selected = false;
                found.selected = true;
                this.mainData.previousSelectedPC = found;
                
            }
            else {
                // reload dissasembly
                this.reloaddissasembly();
            }
        }
        if (this.mainData.sourceCode != null && this.mainData.sourceCode.files != null) {
            // make address 4 chars
            var address = AsmTools.numToHex4(data.programCounter);

            for (var i = 0; i < this.mainData.sourceCode.files.length; i++) {
                var file = this.mainData.sourceCode.files[i];
                if (file.lines == null) break;
                var foundL = (<any>file.lines).find(x => x.data.resultMemoryAddress === address);
                if (foundL != null) {
                    if (!foundL.selected) {
                        if (this.mainData.previousSelectedLine != null)
                            this.mainData.previousSelectedLine.selected = false;
                        foundL.selected = true;
                        this.mainData.previousSelectedLine = foundL;
                        this.currentLine = this.mainData.previousSelectedLine;
                        
                    }
                    break;
                }
            }
        }
    }

    public LoadLabelValues() {
        var thiss = this;
        //   this.processorService.getLabels((l) => {
        //    thiss.parseLabels(l);
        //});
        if (this.editorData.variables == null) return;
        var variables: IPropertyData[] = [];
        for (var i = 0; i < this.editorData.variables.length; i++) {
            var label = this.editorData.variables[i];
            if (!label.isVariable || label.property == null) continue;
            variables.push(label.property)
        }
        this.computerService.getLabelValues(variables,(l) => {
            thiss.parseLabels(l);
        });
    }

    private parseLabels(l: ISourceCodeLabel[]) {
        if (this.mainData.sourceCode == null) return;
        for (var i = 0; i < l.length; i++) {
            var label = l[i];
            var editorLabel: IEditorLabel | null | undefined = this.editorData.labels.find(x => x.data.name === label.name);
            if (editorLabel == null || editorLabel == undefined)
                continue;
            editorLabel.data.value = label.value;
            editorLabel.labelhexValue = AsmTools.numToHex2(label.value);
            editorLabel.labelhexAddress = AsmTools.numToHex4(label.address);
            editorLabel.data.variableLength = editorLabel.labelhexValue.replace("$","").length / 2;
        }
    }


    //#region Breakpoints
    public SetBreakpointCurrentLine(file: IEditorFile | null, line: IEditorLine | null) {
        if (this.mainData.sourceCode == null) return;
        this.breakPointsManager.SetBreakpointCurrentLine(this.mainData.sourceCode?.files, file, line);
    }

    private BreakPointsChanged(r: IDebuggerBreakpoint[] | null) {
        if (r == null) return;
        if (r.length > 0)
            this.StartPinging();
        else
            this.StopPinging();
    }
    //#endregion Breakpoints

    public reloaddissasembly() {
        var thiss = this;
        var startt = 0;
        if (thiss.data != null && thiss.data.data6502 != null)
            startt = thiss.data.data6502.programCounter;
        this.debuggerService.GetDisassembly(startt, 10, r => {
            thiss.data.dissasembly = r;
            thiss.computerService.GetProcessorData();
        });
    }

    private pingTimerRef: number = -1;
    private StartPinging() {
        var thiss = this;
        if (this.pingTimerRef != -1)
            clearInterval(this.pingTimerRef);
        this.pingTimerRef = setInterval(() => { thiss.updateAll(); }, 3000);
    }
    private StopPinging() {
        if (this.pingTimerRef == -1) return;
        clearInterval(this.pingTimerRef);
        this.pingTimerRef = -1;
    }
   

    public Run() {
        var thiss = this;
        this.debuggerService.Run(() => {
           
            setTimeout(() => {
                thiss.updateAll();
                setTimeout(() => {
                    thiss.ScrollToDebuggerLine();
                    thiss.LoadLabelValues();
                }, 500);
            },500);
        })
    }

    public NextStep() {
        var thiss = this;
        this.debuggerService.NextStep((r0) => {
            thiss.updateAll();
            setTimeout(() => thiss.ScrollToDebuggerLine(), 500);
        })
    }

    public StepOver() {
        var thiss = this;
        this.debuggerService.StepOver((r0) => {
            thiss.updateAll();
            setTimeout(() => thiss.ScrollToDebuggerLine(), 500);
        })
    }
    private ScrollToDebuggerLine() {
        if (this.currentLine == null) return;
        AsmTools.scrollIntoViewIfOutOfView("line" + (this.currentLine.data.lineNumber),true);
    }
  
 
    public ChangeLabelValue(label: IEditorLabel, newValue:number) {
        var thiss = this;
       
        this.debuggerService.ChangeLabelValue(label.data.name, newValue, (r0) => {
            thiss.LoadLabelValues();
        })
        return false;
    }

    public static ServiceName: ServiceName = { Name: "ProcessorManager" };
}
