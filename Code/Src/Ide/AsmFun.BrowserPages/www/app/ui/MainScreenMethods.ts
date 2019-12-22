// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion


// TODO : clean up this mess

import { AsmTools } from "../Tools.js"
import { ProcessorManager } from "../core/ProcessorManager.js"
import { IMainData } from "../data/MainData.js";
import { IEditorFile, IEditorLine, IEditorLabel } from "../data/EditorData.js";
import { ProjectSaveCommand, ProjectSaveFolderCommand, ProjectRequestCreateNewCommand, ProjectCreateNewCommand, ProjectLoadWebCommand, ProjectLoadLocalCommand, ProjectOpenManagerCommand, ProjectOpenProjectWebsiteCommand } from "../data/commands/ProjectsCommands.js";
import { IBaseCommand } from "../data/commands/CommandsCommon.js";
import { IProjectDetail } from "../data/ProjectData.js";
import { EditorEnableCommand, EditorSelectFileCommand, EditorSwapOutputCommand } from "../data/commands/EditorCommands.js";
import { SettingsOpenManagerCommand } from "../data/commands/SettingsCommands.js";
import {
    ProcessorOpenDebuggerCommand, ProcessorNextStepCommand, ProcessorStepOverCommand, ProcessorDebuggerRunCommand, ProcessorReloadValuesCommand,
    ProcessorDebuggerSetBreakpointCommand
} from "../data/commands/ProcessorCommands.js";
import { MemoryOpenManagerCommand, MemoryItemHoverCommand, MemoryNextPageCommand, MemoryPreviousPageCommand, MemoryScrollCommand } from "../data/commands/MemoryCommands.js";
import {
    ComputerStopCommand, ComputerStartCommand, ComputerOpenManagerCommand, ComputerResetCommand, ComputerLoadProgramCommand,
    ComputerRunProgramCommand, ComputerOpenDetailCommand
} from "../data/commands/ComputerCommands.js";
import { ASMFunPlayerManager } from "../core/ASMFunPlayerManager.js";


export class MainScreenMethods {

    public static S: MainScreenMethods;
    private mainData: IMainData;
    private lastEditedLabel?: IEditorLabel | null;

    constructor(mainData: IMainData) {
        this.mainData = mainData;
        MainScreenMethods.S = this;
    }

    // Todo: Clean this mess up

    public SourCodeLineClick(domObj, evt: any, line) {
        (<any>window).moveTheCursor(domObj, evt);
        return true;
    }
  
    public CheckPlayerAvailable() {
        var svc = MainScreenMethods.S.mainData.container.Resolve<ASMFunPlayerManager>(ASMFunPlayerManager.ServiceName);
        if (svc == null) return;
        svc.CheckPlayerAvailable(() => { }, () => { });
    }

    // Todo : clean this up with commands
    public SwapChangeLabelValue(line: IEditorLine) {
        if (line.label == null || line.label === undefined) return;
        var label: IEditorLabel = line.label;
        if (MainScreenMethods.S.lastEditedLabel != null && MainScreenMethods.S.lastEditedLabel.isInEditMode === true) {
            MainScreenMethods.S.lastEditedLabel.isInEditMode = false;
        }
        console.log("SwapChangeLabelValue:" + label.data.name);
        label.isInEditMode = !label.isInEditMode;
        if (label.isInEditMode) {
            label.newValue = label.labelhexValue;
        }
        MainScreenMethods.S.SetEditorEnable(!label.isInEditMode);
        MainScreenMethods.S.lastEditedLabel = label;
        setTimeout(() => {
            var el = document.getElementById('labelEdit' + line.data.lineNumber);
            if (el != null)
                el.focus();
        }, 50);
    }
    public ChangeLabelValue(evt, label: IEditorLabel) {
        
        if (evt.keyCode === 13) {
            console.log("ChangeLabelValue:" + label.data.name + " = " + label.newValue);
            if (label.newValue == null || label.newValue === "") return;
            var newValue = AsmTools.hexToNum(label.newValue);
            if (newValue == label.data.value) return;
            MainScreenMethods.S.mainData.container.Resolve<ProcessorManager>(ProcessorManager.ServiceName)?.ChangeLabelValue(label, newValue);
            label.isInEditMode = false;
            MainScreenMethods.S.SetEditorEnable(true);
        }
        else if (evt.keyCode === 27) {
            label.isInEditMode = false;
            MainScreenMethods.S.SetEditorEnable(true);
        }
    }
  
   

    // Processor & Debugger
    public SwapShowDebugger() { MainScreenMethods.ExecuteCommand(new ProcessorOpenDebuggerCommand(null)); }
    public DbgNextStep() { MainScreenMethods.ExecuteCommand(new ProcessorNextStepCommand()); }
    public DbgStepOver() { MainScreenMethods.ExecuteCommand(new ProcessorStepOverCommand()); }
    public DbgRun() { MainScreenMethods.ExecuteCommand(new ProcessorDebuggerRunCommand()); }
    public DbgLoadLabelValues() { MainScreenMethods.ExecuteCommand(new ProcessorReloadValuesCommand()); }
    public DbgSetBreakpointCurrentLine(file, line) { MainScreenMethods.ExecuteCommand(new ProcessorDebuggerSetBreakpointCommand(file,line)); }

    // Emulator
    public ComputerOpenManager(state: boolean | null) { MainScreenMethods.ExecuteCommand(new ComputerOpenManagerCommand(state)); }
    public ComputerStart() { MainScreenMethods.ExecuteCommand(new ComputerStartCommand()); }
    public ComputerStop() { MainScreenMethods.ExecuteCommand(new ComputerStopCommand()); }
    public ComputerReset() { MainScreenMethods.ExecuteCommand(new ComputerResetCommand()); }
    public ComputerLoadProgram() { MainScreenMethods.ExecuteCommand(new ComputerLoadProgramCommand()); }
    public ComputerRunProgram() { MainScreenMethods.ExecuteCommand(new ComputerRunProgramCommand()); }
    public ComputerOpenDetail(state: boolean | null) { MainScreenMethods.ExecuteCommand(new ComputerOpenDetailCommand(state)); }

    // Memory
    public MemoryOpenManager(state: boolean | null) { MainScreenMethods.ExecuteCommand(new MemoryOpenManagerCommand(state)); }
    public MemoryScroll(element) { MainScreenMethods.ExecuteCommand(new MemoryScrollCommand(element.deltaY)); }
    public MemoryItemHover(index: number, address: number, value: number) { MainScreenMethods.ExecuteCommand(new MemoryItemHoverCommand(index, address, value)); }
    public NextMemoryPage(factor: number) { MainScreenMethods.ExecuteCommand(new MemoryNextPageCommand(factor)); }
    public PreviousMemoryPage(factor: number) { MainScreenMethods.ExecuteCommand(new MemoryPreviousPageCommand(factor)); }

    // Settings
    public SettingsOpenManager(state: boolean | null) { MainScreenMethods.ExecuteCommand(new SettingsOpenManagerCommand(state)); }
    
    // Editor
    private SetEditorEnable(state: boolean) { MainScreenMethods.ExecuteCommand(new EditorEnableCommand(state)); }
    public SelectFile(file: IEditorFile) { MainScreenMethods.ExecuteCommand(new EditorSelectFileCommand(file));}
    public SwapOutputWindow() { MainScreenMethods.ExecuteCommand(new EditorSwapOutputCommand(null));}

    // Project manager
    public ProjectOpenManager(state: boolean | null) { MainScreenMethods.ExecuteCommand(new ProjectOpenManagerCommand(state)); }
    public ProjectSaveFolder() { MainScreenMethods.ExecuteCommand(new ProjectSaveFolderCommand()); }
    public ProjectCreateNew() { MainScreenMethods.ExecuteCommand(new ProjectCreateNewCommand()); }
    public ProjectRequestCreateNew() { MainScreenMethods.ExecuteCommand(new ProjectRequestCreateNewCommand()); }
    public ProjectLoadWeb(detail: IProjectDetail | null) { MainScreenMethods.ExecuteCommand(new ProjectLoadWebCommand(detail)); }
    public ProjectLoadLocal(detail: IProjectDetail | null) { MainScreenMethods.ExecuteCommand(new ProjectLoadLocalCommand(detail)); }
    public ProjectOpenProjectWebsite(detail: IProjectDetail | null) { MainScreenMethods.ExecuteCommand(new ProjectOpenProjectWebsiteCommand(detail)); }
   
    public SaveProject() {
        var mainData = MainScreenMethods.S.mainData;
        if (mainData.sourceCode == null || mainData.sourceCode.files == null || mainData.sourceCode.files.length === 0)
            return;
        MainScreenMethods.ExecuteCommand(new ProjectSaveCommand(mainData.sourceCode));
    }



    private static ExecuteCommand(command: IBaseCommand) {
        MainScreenMethods.S.mainData.commandManager.InvokeCommand(command);
    }
}
