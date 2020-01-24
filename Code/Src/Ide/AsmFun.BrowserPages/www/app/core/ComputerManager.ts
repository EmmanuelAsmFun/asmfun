// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { ComputerService } from "../services/ComputerService.js";
import { IAsmFunAppData } from "../data/AsmFunAppData.js"
import { IMainData } from "../data/MainData.js";
import { IComputerManagerData, IKeyboardKey } from "../data/ComputerData.js";
import { EditorEnableCommand } from "../data/commands/EditorCommands.js";
import { ComputerOpenManagerCommand, ComputerStopCommand, ComputerStartCommand, ComputerResetCommand, ComputerLoadProgramCommand, ComputerRunProgramCommand, ComputerOpenDetailCommand, ComputerProcessorDataChanged, ComputerUpdateStateCommand } from "../data/commands/ComputerCommands.js";
import { ServiceName } from "../serviceLoc/ServiceName.js";
import { KeyboardManager } from "./KeyboardManager.js";
import { IProcessorData } from "../data/ProcessorData.js";


export class ComputerManager {
    
    private computerService: ComputerService;
    private mainData: IMainData;
    private myAppData: IAsmFunAppData;
    private data: IComputerManagerData;
    

    constructor(mainData: IMainData) {
        this.mainData = mainData;
        this.myAppData = mainData.appData;
        this.data = mainData.appData.computer;
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
        this.data.isVisible = false;
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