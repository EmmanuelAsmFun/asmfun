﻿// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import {
    ComputerOpenManagerCommand, ComputerStopCommand, ComputerStartCommand, ComputerResetCommand, ComputerLoadProgramCommand, ComputerRunProgramCommand,
    ComputerOpenDetailCommand, ComputerProcessorDataChanged, ComputerUpdateStateCommand
} from "./commands/ComputerCommands.js";
import { ComputerService } from "./services/ComputerService.js";
import { IMainData } from "../../framework/data/MainData.js";
import { IAsmFunAppData } from "../player/data/AsmFunAppData.js";
import { IComputerManagerData } from "./data/ComputerData.js";
import { IProjectSettings } from "../project/data/ProjectData.js";
import { ProjectSettingsLoaded } from "../project/commands/ProjectsCommands.js";
import { NotifyIcon } from "../../common/Enums.js";
import { IProcessorData } from "../processor/data/ProcessorData.js";
import { EditorEnableCommand } from "../editor/commands/EditorCommands.js";
import { ServiceName } from "../../framework/serviceLoc/ServiceName.js";
import { UIDataNameComputer } from "./ComputerFactory.js";


export class ComputerManager {
   
    private computerService: ComputerService;
    private mainData: IMainData;
    private myAppData: IAsmFunAppData;
    private data: IComputerManagerData;
    
    private lastProjectSettings: IProjectSettings | null;
    

    constructor(mainData: IMainData) {
        this.mainData = mainData;
        this.myAppData = mainData.appData;
        this.data = mainData.GetUIData(UIDataNameComputer);
        this.lastProjectSettings = null;
        this.computerService = this.mainData.container.Resolve<ComputerService>(ComputerService.ServiceName) ?? new ComputerService(mainData);
        
        this.mainData.commandManager.Subscribe2(new ComputerOpenManagerCommand(null), this, x => this.OpenManager(x.state));
        this.mainData.commandManager.Subscribe2(new ComputerStartCommand(), this, x => this.StartComputer());
        this.mainData.commandManager.Subscribe2(new ComputerStopCommand(), this, x => this.StopComputer());
        this.mainData.commandManager.Subscribe2(new ComputerResetCommand(), this, x => this.ResetComputer());
        this.mainData.commandManager.Subscribe2(new ComputerLoadProgramCommand(), this, x => this.LoadProgram());
        this.mainData.commandManager.Subscribe2(new ComputerRunProgramCommand(), this, x => this.RunProgram());
        this.mainData.commandManager.Subscribe2(new ComputerOpenDetailCommand(null), this, x => this.OpenDetailState(x.state));
        this.mainData.commandManager.Subscribe2(new ComputerUpdateStateCommand(), this, x => this.UpdateComputerState(false));
        this.mainData.eventManager.Subscribe2(new ComputerProcessorDataChanged(null), this, x => this.ParseProcessorData(x.processorData));
        this.mainData.eventManager.Subscribe2(new ProjectSettingsLoaded(), this, x => this.ProjectSettingsLoaded(x.projectSettings));

        
        // Load first state
        setTimeout(() => { this.UpdateComputerState(false); }, 100);
        // Load every 5 seconds the state
        setInterval(() => { this.UpdateComputerState(false); }, 5000);
    }

    private StartComputer() {
        var thiss = this;
        this.computerService.StartComputer(() => {
            thiss.LoadProgram();
            this.UpdateComputerState(true);
        });
    }
   
    private StopComputer() {
        this.computerService.StopComputer(() => {
            this.UpdateComputerState(true);
        });
    }

    public ResetComputer() {
        var thiss = this;
        this.computerService.ResetComputer(() => {
            this.UpdateComputerState(true);
        });
    }

    private LoadProgram() {
        this.computerService.LoadProgram(() => {
            this.UpdateComputerState(true);
            this.myAppData.alertMessages.NotifyWithDuration("Program written", NotifyIcon.OK, 700);
        });
       
    }

    private RunProgram() {
        this.computerService.RunProgram(() => {
            this.UpdateComputerState(true);
           
        });
    }

    private UpdateComputerState(withDelay: boolean) {
        if (withDelay) 
            setTimeout(() => this.computerService.GetProcessorData(), 500);
        else
            this.computerService.GetProcessorData();
    }

    private ParseProcessorData(processorData: IProcessorData | null) {
        if (processorData == null) {
            this.data.isComputerRunning = false;
            return;
        }
        this.data.isComputerRunning = processorData.isComputerRunning;
        if (processorData.isComputerRunning)
            this.data.processorData = processorData;
    }

    private ProjectSettingsLoaded(projectSettings: IProjectSettings | null): void {
        if (projectSettings == null) return;
        if (this.lastProjectSettings != null && this.lastProjectSettings.detail != null && this.lastProjectSettings.detail.name !== projectSettings.detail.name) {
            // When new settings are loaded, we need to stop the computer so the correct ROM can be loaded with the correct settings.
            this.StopComputer();
        }
        this.lastProjectSettings = projectSettings;
    }


    private OpenManager(state: boolean | null) {
        if (state == null)
            state = !this.data.isVisible;
        if (state === this.data.isVisible) return;
        if (!state)
            this.Close();
        else {
            this.Open();
            this.StartComputer();
        }
    }


    private Open() {
        var thiss = this;
        thiss.data.isVisible = true;
    }

    private Close() {
       // this.data.isVisible = false;
    }

    private OpenDetailState(state: boolean | null) {
        if (state == null)
            state = !this.data.isDetailVisible;
        if (state === this.data.isDetailVisible) return;
        if (!state)
            this.CloseDetail();
        else
            this.OpenDetail();
    }

    private OpenDetail() {
        var thiss = this;
        this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(false));
        thiss.data.isDetailVisible = true;
    }

    private CloseDetail() {
        this.mainData.commandManager.InvokeCommand(new EditorEnableCommand(true));
        this.data.isDetailVisible = false;
    }

    public static NewData(): IComputerManagerData {
        return {
            isVisible: false,
            isDetailVisible: false,
            isComputerRunning: false,
            processorData: null,
        };
    }
    public static ServiceName: ServiceName = { Name: "ComputerManager" };
}