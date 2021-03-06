﻿// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IEditorFile, IEditorLine, IEditorManagerData } from "../editor/data/EditorData.js";
import { DebuggerService } from "./services/DebuggerService.js";
import { IMainData } from "../../framework/data/MainData.js";
import { EditorManager } from "../editor/EditorManager.js";
import { AsmTools } from "../../Tools.js";
import { UIDataNameEditor } from "../editor/EditorFactory.js";
import { ServiceName } from "../../framework/serviceLoc/ServiceName.js";
import { IBreakPointsManagerData, UIDataNameBreakPoints, IDebuggerBreakpoint, IBreakpointUIData } from "./data/BreakPointsData.js";
import { ComputerStarted } from "../computer/commands/ComputerCommands.js";
import { ProcessorBreakpointSwapStateCommand, ProcessorBreakpointSetByAddressCommand } from "./commands/ProcessorCommands.js";
import { IUILine } from "../editor/ui/IUILine.js";
import { IUIFile } from "../editor/ui/IUIFile.js";
import { SourceCodeLoadedAndParsed } from "../editor/commands/SourceCodeCommands.js";
import { SourceCodeManager } from "../editor/SourceCodeManager.js";

export class BreakPointsManager {
    
   
    private lastFiles: IEditorFile[] | null = null;

    private usedBreakPoints: IUILine[] = [];
    private breakPoints: IDebuggerBreakpoint[] = [];
    private debuggerService: DebuggerService;
    private editorManger: EditorManager;
    private sourceCodeManager: SourceCodeManager;
    private editorData: IEditorManagerData;
    private data: IBreakPointsManagerData;

    public constructor(mainData: IMainData) {

        this.editorData = mainData.GetUIData(UIDataNameEditor);
        this.data = mainData.GetUIData(UIDataNameBreakPoints);
        // Resolve services
        this.debuggerService = mainData.container.Resolve<DebuggerService>(DebuggerService.ServiceName) ?? new DebuggerService(mainData);
        this.editorManger = mainData.container.Resolve<EditorManager>(EditorManager.ServiceName) ?? new EditorManager(mainData);
        this.sourceCodeManager = mainData.container.Resolve<SourceCodeManager>(SourceCodeManager.ServiceName) ?? new SourceCodeManager(mainData);
        // Subscribe to commands
        mainData.commandManager.Subscribe2(new ProcessorBreakpointSwapStateCommand(null), this, (x) => this.BreakpointSwapState(x.breakpoint));
        mainData.commandManager.Subscribe2(new ProcessorBreakpointSetByAddressCommand(null), this, (x) => this.SetByAddress(x.breakpointAddress, x.state));
        // Subscribe to events
        mainData.eventManager.Subscribe2(new ComputerStarted(), this, () => this.ComputerStarted());
        mainData.eventManager.Subscribe2(new SourceCodeLoadedAndParsed(), this, () => this.LoadBreakPointsFromSource());
    

        this.data.swapAddBreakPoint = (s) => {
            this.data.isAddingBreakpointAddress = s;
            mainData.popupManager.InvokeLayerIsOpen(0, s);
        };
        this.data.addBreakPoint = () => {
            this.SetByAddress(this.data.newBreakpointAddress, true);
            this.data.isAddingBreakpointAddress = false;
            mainData.popupManager.InvokeLayerIsOpen(0, false);
        };
    }

    public SetBreakpointCurrentLine(files: IEditorFile[], fileUI: IUIFile | null, line: IUILine | null) {
        this.lastFiles = files;
        if (fileUI == null || line == null) return;
        var file = files[fileUI.Index];
        // Check if the line has an address, otherwise search first next line with address
        if (!line.CanSetBreakPoint) {
            var found = false;
            if (file.lines == null) return;
            var lineIndex = line.LineNumber -1;
            for (var i = 0; i < 100; i++) {
                line = file.lines[i + lineIndex].Ui;
                if (line.CanSetBreakPoint) {
                    found = true;
                    break;
                }
                lineIndex++;
                if (i + lineIndex > file.lines.length) break;
            }
            if (!found) {
                console.log("No address found to set a breakpoint");
                return;
            }
        }
        var ln = line.LineNumber;
        var address = parseInt(line.Address, 16);
        var uiBreakPoint = this.data.list.find(x => x.Address == address);
        var state = false;
        if (uiBreakPoint == null) {
            uiBreakPoint = this.CreateUiBreakpoint(address, line.Address, this.data.list.length);
            uiBreakPoint.LineNumber = ln;
            state = true;
        }
        else {
            // delete the breakpoint by set enable to false and state to false
            uiBreakPoint.IsEnabled = false;
            state = false;
        }
        line.HasBreakPoint = state;
        
        var inArrayIndex = this.usedBreakPoints.findIndex(x => x.LineNumber === ln);
        if (inArrayIndex > -1)
            this.usedBreakPoints[inArrayIndex] = line;
        else
            this.usedBreakPoints.push(line);
        this.SetBreakpoint(uiBreakPoint, state);
    }
    public SetBreakpoint(uiBreakPoint: IBreakpointUIData, state: boolean) {
        this.debuggerService.SetBreakpoint(uiBreakPoint.Index, uiBreakPoint.Address, state, uiBreakPoint.IsEnabled, () => {
            this.LoadBreakPoints(null);
        });
        this.editorManger.RedrawLine();
    }

    private ComputerStarted(): void {
        this.LoadBreakPointsFromSource();
    }

    public LoadBreakPointsFromSource() {
        var bundle = this.sourceCodeManager.GetEditorBundle();
        if (bundle == null) return;
        this.LoadBreakPoints(bundle.files);
    }

    public LoadBreakPoints(files: IEditorFile[] | null) {
        var thiss = this;
        if (files != null)
            this.lastFiles = files;
        if (this.lastFiles == null) return;
        this.debuggerService.GetBreakPoints((r) => {
            if (r == null) return;
            thiss.ParseBreakpoints(r, this.lastFiles);
        });
    }

    private ParseBreakpoints(r: IDebuggerBreakpoint[], files: IEditorFile[] | null) {
        // unselect all previous used breakpoints lines
        this.usedBreakPoints.forEach(x => { x.HasBreakPoint = false; });
        this.breakPoints = r;
        var breakPointsHex: string[] = [];
        this.data.list = [];
        for (var i = 0; i < r.length; i++) {
            var bp = r[i];
            var address = AsmTools.numToHex5(bp.address);
            breakPointsHex.push(address);
            var uiBreakPoint = this.CreateUiBreakpoint(bp.address, address, bp.index);
            uiBreakPoint.IsEnabled = bp.isEnabled;
            this.data.list.push(uiBreakPoint);
           
        }
        this.editorData.breakPoints = breakPointsHex;
        // console.log(breakPointsHex,this.data.list.map(x => x.Index));
        if (files == null) return;
        for (var i = 0; i < files.length; i++) {
            var file = files[i];
            if (file.lines == null) continue;
            for (var j = 0; j < file.lines.length; j++) {
                var line = file.lines[j];
                for (var k = 0; k < breakPointsHex.length; k++) {
                    var breakpoint = breakPointsHex[k];
                    if (line.Ui.Address == breakpoint) {
                        line.Ui.HasBreakPoint = true;
                        var uiLine = this.data.list[k];
                        uiLine.File = file.Ui;
                        uiLine.Line = line.Ui;
                        uiLine.LineNumber = line.data.lineNumber;
                        uiLine.LineText = line.data.sourceCode.replace(/ /g, '&nbsp;');
                        var inArrayIndex = this.usedBreakPoints.findIndex(x => x.LineNumber === uiLine.LineNumber);
                        if (inArrayIndex > -1)
                            this.usedBreakPoints[inArrayIndex] = line.Ui;
                        else
                            this.usedBreakPoints.push(line.Ui);
                    }
                }

            }
        }
    }



    private BreakpointSwapState(uiBreakPoint: IBreakpointUIData | null): void {
        if (uiBreakPoint == null) return;
        debugger;
        uiBreakPoint.IsEnabled = !uiBreakPoint.IsEnabled;
        this.SetBreakpoint(uiBreakPoint, true);
    }

    public SetByAddress(breakpointAddress: string | null, state: boolean): void {
        if (breakpointAddress == null) return;
        var address = parseInt(breakpointAddress, 16);
        var uiBreakPoint: IBreakpointUIData = this.CreateUiBreakpoint(address, breakpointAddress, this.data.list.length);
        if (!state) {
            var uiBreakPointTemp = this.data.list.find(x => x.AddressHex == breakpointAddress);
            if (uiBreakPointTemp != undefined)
                uiBreakPoint = uiBreakPointTemp;
            uiBreakPoint.IsEnabled = false;
        }
        this.SetBreakpoint(uiBreakPoint, state);
    }
    public HasBreakpoints() {
        return this.breakPoints.length > 0;
    }


    private CreateUiBreakpoint(address: number, addressHex: string, index: number): IBreakpointUIData {
        var uiBreakPoint: IBreakpointUIData = {
            Address: address,
            AddressHex: addressHex,
            IsEnabled: true,
            LineNumber: 0,
            File: null,
            Line: null,
            Index: index,
            LineText: "",
        };
        return uiBreakPoint;
    }

    public static ServiceName: ServiceName = { Name: "BreakPointsManager" };
}