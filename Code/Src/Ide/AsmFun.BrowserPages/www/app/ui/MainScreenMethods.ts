// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

// TODO : clean up this mess

import { EditorEnableCommand } from "../features/editor/commands/EditorCommands.js";
import { ProjectSaveCommand } from "../features/project/commands/ProjectsCommands.js";
import { IBaseCommand } from "../framework/commands/CommandsCommon.js";
import { IMainData } from "../framework/data/MainData.js";
import { IEditorLabel } from "../features/editor/data/EditorData.js";



export class MainScreenMethods {

    public static S: MainScreenMethods;
    public mainData: IMainData;
    public lastEditedLabel?: IEditorLabel | null;

    constructor(mainData: IMainData) {
        this.mainData = mainData;
        MainScreenMethods.S = this;
    }
    public SetEditorEnable(state: boolean) { MainScreenMethods.ExecuteCommand(new EditorEnableCommand(state)); }
    public SaveProject() {
        var mainData = MainScreenMethods.S.mainData;
        if (mainData.sourceCode == null || mainData.sourceCode.files == null || mainData.sourceCode.files.length === 0)
            return;
        MainScreenMethods.ExecuteCommand(new ProjectSaveCommand(mainData.sourceCode));
    }



    public static ExecuteCommand(command: IBaseCommand) {
        MainScreenMethods.S.mainData.commandManager.InvokeCommand(command);
    }


    //// Todo: Clean this mess up

    //public SourCodeLineClick(evt: any) {
    //    (<any>window).moveTheCursor(evt);
    //    return true;
    //}
  
    //public CheckPlayerAvailable() {
    //    var svc = MainScreenMethods.S.mainData.container.Resolve<ASMFunPlayerManager>(ASMFunPlayerManager.ServiceName);
    //    if (svc == null) return;
    //    svc.CheckPlayerAvailable(() => { }, () => { },false);
    //}

    //// Todo : clean this up with commands
    //public SwapChangeLabelValue(line: IEditorLine) {
    //    if (line.label == null || line.label === undefined) return;
    //    var label: IEditorLabel = line.label;
    //    if (MainScreenMethods.S.lastEditedLabel != null && MainScreenMethods.S.lastEditedLabel.isInEditMode === true) {
    //        MainScreenMethods.S.lastEditedLabel.isInEditMode = false;
    //    }
    //    console.log("SwapChangeLabelValue:" + label.data.name);
    //    label.isInEditMode = !label.isInEditMode;
    //    if (label.isInEditMode) {
    //        label.newValue = label.labelhexValue;
    //    }
    //    MainScreenMethods.S.SetEditorEnable(!label.isInEditMode);
    //    MainScreenMethods.S.lastEditedLabel = label;
    //    setTimeout(() => {
    //        var el = document.getElementById('labelEdit' + line.data.lineNumber);
    //        if (el != null)
    //            el.focus();
    //    }, 50);
    //}
    //public ChangeLabelValue(e: KeyboardEvent, label: IEditorLabel) {
        
    //    if (e.keyCode === 13) {
    //        console.log("ChangeLabelValue:" + label.data.name + " = " + label.newValue);
    //        if (label.newValue == null || label.newValue === "") return;
    //        var newValue = AsmTools.hexToNum(label.newValue);
    //        if (newValue == label.data.value) return;
    //        MainScreenMethods.S.mainData.container.Resolve<ProcessorManager>(ProcessorManager.ServiceName)?.ChangeLabelValue(label, newValue);
    //        label.isInEditMode = false;
    //        MainScreenMethods.S.SetEditorEnable(true);
    //        e.stopPropagation();
    //        e.preventDefault();
    //        e.returnValue = false;
    //        e.cancelBubble = true;
    //        return false;
    //    }
    //    else if (e.keyCode === 27) {
    //        label.isInEditMode = false;
    //        MainScreenMethods.S.SetEditorEnable(true);
    //        e.stopPropagation();
    //        e.preventDefault();
    //        e.returnValue = false;
    //        e.cancelBubble = true;
    //        return false;
    //    }
       
    //}
  
   

    //// Processor & Debugger
    //public SwapShowDebugger() { MainScreenMethods.ExecuteCommand(new ProcessorOpenDebuggerCommand(null)); }
    //public DbgNextStep() { MainScreenMethods.ExecuteCommand(new ProcessorNextStepCommand()); }
    //public DbgStepOver() { MainScreenMethods.ExecuteCommand(new ProcessorStepOverCommand()); }
    //public DbgRun() { MainScreenMethods.ExecuteCommand(new ProcessorDebuggerRunCommand()); }
    //public DbgLoadLabelValues() { MainScreenMethods.ExecuteCommand(new ProcessorReloadValuesCommand()); }
    //public DbgSetBreakpointCurrentLine(file, line) { MainScreenMethods.ExecuteCommand(new ProcessorDebuggerSetBreakpointCommand(file,line)); }

    //// Emulator
    //public ComputerOpenManager(state: boolean | null) { MainScreenMethods.ExecuteCommand(new ComputerOpenManagerCommand(state)); }
    //public ComputerStart() { MainScreenMethods.ExecuteCommand(new ComputerStartCommand()); }
    //public ComputerStop() { MainScreenMethods.ExecuteCommand(new ComputerStopCommand()); }
    //public ComputerReset() { MainScreenMethods.ExecuteCommand(new ComputerResetCommand()); }
    //public ComputerLoadProgram() { MainScreenMethods.ExecuteCommand(new ComputerLoadProgramCommand()); }
    //public ComputerRunProgram() { MainScreenMethods.ExecuteCommand(new ComputerRunProgramCommand()); }
    //public ComputerOpenDetail(state: boolean | null) { MainScreenMethods.ExecuteCommand(new ComputerOpenDetailCommand(state)); }
    //public ComputerUpdateState(state: boolean | null) { MainScreenMethods.ExecuteCommand(new ComputerUpdateStateCommand()); }

    //// Memory
    //public MemoryOpenManager(state: boolean | null) { MainScreenMethods.ExecuteCommand(new MemoryOpenManagerCommand(state)); }
    //public MemoryScroll(element) { MainScreenMethods.ExecuteCommand(new MemoryScrollCommand(element.deltaY)); }
    //public MemoryItemHover(index: number, address: number, value: number) { MainScreenMethods.ExecuteCommand(new MemoryItemHoverCommand(index, address, value)); }
    //public MemoryEdit(address: number, el?: HTMLElement) { MainScreenMethods.ExecuteCommand(new MemoryEditCommand(address,el)); }
    //public NextMemoryPage(factor: number) { MainScreenMethods.ExecuteCommand(new MemoryNextPageCommand(factor)); }
    //public PreviousMemoryPage(factor: number) { MainScreenMethods.ExecuteCommand(new MemoryPreviousPageCommand(factor)); }
    //public SelectMemoryPage(startAddress: number) { MainScreenMethods.ExecuteCommand(new MemorySelectPageCommand(startAddress)); }

    //// Settings
    //public SettingsOpenManager(state: boolean | null) { MainScreenMethods.ExecuteCommand(new SettingsOpenManagerCommand(state)); }
    //public SettingsSelectCompilerFile(type: string) { MainScreenMethods.ExecuteCommand(new SettingsSelectCompilerFileCommand(type)); }
    //public UserSaveUserSettings() { MainScreenMethods.ExecuteCommand(new UserSaveUserSettingsCommand()); }

    //// ASMFun player manager
    //public ASMFunPlayerOpenManager(state: boolean | null) { MainScreenMethods.ExecuteCommand(new ASMFunPlayerOpenManagerCommand(state)); }
    //public ASMFunPlayerSelectOS(osName: string) { MainScreenMethods.ExecuteCommand(new ASMFunPlayerSelectOSCommand(osName)); }
    
    //// Editor
    //public SetEditorEnable(state: boolean) { MainScreenMethods.ExecuteCommand(new EditorEnableCommand(state)); }
    //public SelectFile(file: IEditorFile) { MainScreenMethods.ExecuteCommand(new EditorSelectFileCommand(file));}
    //public SwapOutputWindow() { MainScreenMethods.ExecuteCommand(new EditorSwapOutputCommand(null));}
    //public EditorReloadLine(line) { MainScreenMethods.ExecuteCommand(new EditorReloadLineCommand(line)); }
    //public EditorScrollToLine(line) { MainScreenMethods.ExecuteCommand(new EditorScrollToLineCommand(line)); }

    //// Video
    //public VideoOpenManager(state: boolean | null) { MainScreenMethods.ExecuteCommand(new VideoOpenManagerCommand(state)); }
    //public VideoReloadAll() { MainScreenMethods.ExecuteCommand(new VideoReloadAllCommand()); }
    //public VideoMemoryDump() { MainScreenMethods.ExecuteCommand(new VideoMemoryDumpCommand()); }
    //public VideoEnableAutoReload(state: boolean | null) { MainScreenMethods.ExecuteCommand(new VideoEnableAutoReloadCommand(state)); }
    //public VideoShowMemoryHex(state: boolean | null) { MainScreenMethods.ExecuteCommand(new VideoShowMemoryHexCommand(state)); }
    //public VideoEnableKeyForwarding(state: boolean | null) { MainScreenMethods.ExecuteCommand(new VideoEnableKeyForwardingCommand(state)); }
    //public VideoPaletteDump() { MainScreenMethods.ExecuteCommand(new VideoPaletteDumpCommand()); }

    //// Project manager
    //public ProjectOpenManager(state: boolean | null) { MainScreenMethods.ExecuteCommand(new ProjectOpenManagerCommand(state)); }
    //public ProjectSaveFolder() { MainScreenMethods.ExecuteCommand(new ProjectSaveFolderCommand()); }
    //public ProjectCreateNew() { MainScreenMethods.ExecuteCommand(new ProjectCreateNewCommand()); }
    //public ProjectRequestLoadProgram() { MainScreenMethods.ExecuteCommand(new ProjectRequestLoadProgramCommand()); }
    //public ProjectRequestCreateNew() { MainScreenMethods.ExecuteCommand(new ProjectRequestCreateNewCommand()); }
    //public ProjectLoadWeb(detail: IProjectDetail | null) { MainScreenMethods.ExecuteCommand(new ProjectLoadWebCommand(detail)); }
    //public ProjectLoadLocal(detail: IProjectDetail | null) { MainScreenMethods.ExecuteCommand(new ProjectLoadLocalCommand(detail)); }
    //public ProjectOpenProjectWebsite(detail: IProjectDetail | null) { MainScreenMethods.ExecuteCommand(new ProjectOpenProjectWebsiteCommand(detail)); }

    // File manager

  
}
