// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { ComputerService } from "../services/ComputerService.js";
import { DebuggerService } from "../services/DebuggerService.js";
import { AsmTools } from "../Tools.js"
import { IAsmFunAppData } from "../data/AsmFunAppData.js"
import { IMainData } from "../data/MainData.js";
import { IDebuggerBreakpoint } from "../data/IDebuggerBreakpoint.js";
import { IEditorLabel, IEditorFile, IEditorLine, IPropertyData } from "../data/EditorData.js";
import { ComputerResetCommand } from "../data/commands/ComputerCommands.js";
import { ISourceCodeLabel } from "../data/ProjectData.js";
import { ServiceName } from "../serviceLoc/ServiceName.js";
import { EditorManager } from "./EditorManager.js";
import { ProcessorOpenDebuggerCommand, ProcessorNextStepCommand, ProcessorStepOverCommand, ProcessorDebuggerRunCommand, ProcessorReloadValuesCommand, ProcessorDebuggerSetBreakpointCommand } from "../data/commands/ProcessorCommands.js";


export class ProcessorManager {
   

    private breakPointLine?: IEditorLine;
    private currentLine?: IEditorLine;

    private computerService: ComputerService
    private debuggerService: DebuggerService
    private mainData: IMainData;
    private myAppData: IAsmFunAppData;

    constructor(mainData: IMainData) {
        this.mainData = mainData;
        this.myAppData = mainData.appData;
        this.computerService = mainData.container.Resolve<ComputerService>(ComputerService.ServiceName)?? new ComputerService();
        this.debuggerService = mainData.container.Resolve<DebuggerService>(DebuggerService.ServiceName)??new DebuggerService();
        this.mainData.commandManager.Subscribe2(new ComputerResetCommand(), this, () => this.ResetEmulator());
        this.mainData.commandManager.Subscribe2(new ProcessorOpenDebuggerCommand(null), this, x => this.OpenManager(x.state));
        this.mainData.commandManager.Subscribe2(new ProcessorNextStepCommand(), this, () => this.NextStep());
        this.mainData.commandManager.Subscribe2(new ProcessorStepOverCommand(), this, () => this.StepOver());
        this.mainData.commandManager.Subscribe2(new ProcessorDebuggerRunCommand(), this, () => this.Run());
        this.mainData.commandManager.Subscribe2(new ProcessorReloadValuesCommand(), this, () => this.LoadLabelValues());
        this.mainData.commandManager.Subscribe2(new ProcessorDebuggerSetBreakpointCommand(null, null), this, (c) => this.setBreakpointCurrentLine(c.file, c.line));
    }

    private OpenManager(state: boolean | null) {
        if (state == null)
            state = !this.mainData.appData.isShowDebugger;
        if (state === this.mainData.appData.isShowDebugger) return;
        if (!state)
            this.Close();
        else
            this.Open();
    }


    private Open() {
        this.mainData.appData.isShowDebugger = true;
    }

    private Close() {
        this.mainData.appData.isShowDebugger = false;
    }


    private ResetEmulator() {
        var thiss = this;
        setTimeout(() => { thiss.updateAll(); }, 3000);
    }

    public updateProcessorData() {
        var thiss = this;
        this.computerService.getProcessorState(r0 => { thiss.parseData6502(r0); });
        // setTimeout(() => { updateProcessorData(app); }, 500);
    }

    public updateAll() {
        this.reloadStack();
        this.reloaddissasembly();
        this.loadBreakPoints();
    }

    public reloadStack() {
        var thiss = this;
        this.computerService.getStack((r) => {
            thiss.myAppData.stack = r;
        });
    }
   


    public parseData6502(data) {
        this.myAppData.data6502 = data;
        if (this.myAppData.dissasembly != null && this.myAppData.dissasembly.datas != null) {
            var found = this.myAppData.dissasembly.datas.find(x => x.address == data.programCounter);
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
        if (this.myAppData.labelsWithoutZones == null) return;
        var variables: IPropertyData[] = [];
        for (var i = 0; i < this.myAppData.labelsWithoutZones.length; i++) {
            var label = this.myAppData.labelsWithoutZones[i];
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
            var editorLabel = (<any>this.mainData.sourceCode.labels).find(x => x.data.name === label.name);
            if (editorLabel == null)
                continue;
            editorLabel.data.value = label.value;
            editorLabel.labelhexValue = AsmTools.numToHex2(label.value);
            editorLabel.labelhexAddress = AsmTools.numToHex4(label.address);
            editorLabel.data.variableLength = editorLabel.labelhexValue.replace("$","").length / 2;
        }
    }

    public setBreakpointCurrentLine(file: IEditorFile | null, line: IEditorLine | null) {
        var thiss = this;
        if (file == null || line == null) return;
        // Check if the line has an address, otherwise search first next line with address
        if (line.data.resultMemoryAddress == null || line.data.resultMemoryAddress === "") {
            var found = false;
            if (file.lines == null) return;
            var lineIndex = file.lines.indexOf(line);
            for (var i = 0; i < 100; i++) {
                line = file.lines[i + lineIndex];
                if (line.data.resultMemoryAddress !== null && line.data.resultMemoryAddress !== "") {
                    found = true;
                    break;
                }
                lineIndex++;
            }
            if (!found) {
                
                console.log("No address found to set a breakpoint");
                return;
            }
        }
        var state = true;
        if (this.breakPointLine === line)
            state = !this.breakPointLine.hasBreakPoint;
        else if (this.breakPointLine != null)
            this.breakPointLine.hasBreakPoint = false;
        this.breakPointLine = line;
        this.breakPointLine.hasBreakPoint = state;
        this.debuggerService.setBreakpoint(0, parseInt("0x" + line.data.resultMemoryAddress), state, () => { });
        this.loadBreakPoints;
        var svc = this.mainData.container.Resolve<EditorManager>(EditorManager.ServiceName)
        if (svc != null)
            svc.RedrawLine();
        setTimeout(() => { thiss.updateAll(); },500);
        if (state)
            this.StartPinging();
        else
            this.StopPinging();
    }

    public loadBreakPoints() {
        var thiss = this;
        this.debuggerService.getBreakPoints((r) => {
            if (r == null) return;
            thiss.parseBreakpoints(r);
        });
    }

    private parseBreakpoints(r: IDebuggerBreakpoint[]) {
        var breakPointsHex: string[] = [];
        for (var i = 0; i < r.length; i++) {
            var address = AsmTools.numToHex4(r[i].address);
            breakPointsHex.push(address);
        }
        if (this.mainData.sourceCode == null || this.mainData.sourceCode.files == null) return;
        for (var i = 0; i < this.mainData.sourceCode.files.length; i++) {
            var file = this.mainData.sourceCode.files[i];
            if (file.lines == null) continue;
            for (var j = 0; j < file.lines.length; j++) {
                var line = file.lines[j];
                for (var k = 0; k < breakPointsHex.length; k++) {
                    var breakpoint = breakPointsHex[k];
                    if (line.data.resultMemoryAddress == breakpoint) {
                        line.hasBreakPoint = true;
                        this.breakPointLine = line;
                    }
                }

            }
        }
        this.myAppData.breakPoints = breakPointsHex;
    }

    public reloaddissasembly() {
        var thiss = this;
        var startt = 0;
        if (thiss.myAppData != null && thiss.myAppData.data6502 != null)
            startt = thiss.myAppData.data6502.programCounter;
        this.debuggerService.getDisassembly(startt, 10, r => {
            thiss.myAppData.dissasembly = r;
            thiss.computerService.getData(r0 => {
                thiss.parseData6502(r0);
            });
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
        this.debuggerService.run(() => {
            thiss.LoadLabelValues();
            thiss.reloaddissasembly();
        })
    }

    public NextStep() {
        var thiss = this;
        this.debuggerService.nextStep((r0) => {
            thiss.parseData6502(r0);
            thiss.LoadLabelValues();
            thiss.reloaddissasembly();
            setTimeout(() => thiss.ScrollToDebuggerLine(), 500);
        })
    }

    public StepOver() {
        var thiss = this;
        this.debuggerService.stepOver((r0) => {
            thiss.parseData6502(r0);
            thiss.LoadLabelValues();
            thiss.reloaddissasembly();
            setTimeout(() => thiss.ScrollToDebuggerLine(), 500);
        })
    }
    private ScrollToDebuggerLine() {
        if (this.currentLine == null) return;
        AsmTools.scrollIntoViewIfOutOfView("line" + (this.currentLine.data.lineNumber),true);
    }
  
 
    public ChangeLabelValue(label: IEditorLabel, newValue:number) {
        var thiss = this;
       
        this.debuggerService.changeLabelValue(label.data.name, newValue, (r0) => {
            thiss.LoadLabelValues();
        })
    }

    public static ServiceName: ServiceName = { Name: "ProcessorManager" };
}
