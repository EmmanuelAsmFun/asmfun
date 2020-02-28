// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { IKeyboardKey, IMemoryDump } from "../data/ComputerData.js";
import { IEventManager } from "../../../framework/IAsmFunEventManager.js";
import { ApiService } from "../../../framework/services/ApiService.js";
import { IMainData } from "../../../framework/data/MainData.js";
import { ComputerProcessorDataChanged, ComputerStarted } from "../commands/ComputerCommands.js";
import { IPropertyType } from "../../editor/data/EditorData.js";
import { ServiceName } from "../../../framework/serviceLoc/ServiceName.js";
import { IAddressDataLabel, IAddressDataLabelResponse } from "../../project/data/ProjectData.js";



export class ComputerService extends ApiService {

    private eventManager: IEventManager;

    constructor(mainData: IMainData) {
        super();
        this.eventManager = mainData.eventManager;
        this.controllerName = "computer";
    }

    public GetProcessorData() {
        this.callApi("GetProcessorData", (r) => {
            this.eventManager.InvokeEvent(new ComputerProcessorDataChanged(r));
        });
    }
    
    public StartComputer(doneMethod) {
        this.callApi("StartComputer", () => {
            this.eventManager.InvokeEvent(new ComputerStarted());
            doneMethod();
        });
    }

    public StopComputer(doneMethod) {
        this.callApi("StopComputer", doneMethod);
    }

    public ResetComputer(doneMethod) {
        this.callApi("ResetComputer", doneMethod);
    }

    public LoadProgram(doneMethod) {
         this.callApi("LoadProgram", doneMethod);
    }

    public RunProgram(doneMethod) {
        this.callApi("RunProgram", doneMethod);
    }
    public GetLoadedMemoryBlocks(doneMethod: (d:IMemoryDump[]) => void) {
        this.callApi("GetLoadedMemoryBlocks", doneMethod);
    }

    public getStack(doneMethod) {
        this.callApi("getStack", doneMethod);
    }

    public getLabels(doneMethod) {
        this.callApi("getLabels", doneMethod);
    }

    public getLabelValues(properties: IAddressDataLabel[], doneMethod: (r: IAddressDataLabelResponse[]) => void) {
        this.post("getLabelValues", properties, doneMethod);
    }

   
    public KeyUp(keyboardKey: IKeyboardKey, doneMethod) {
        this.post("KeyUp", keyboardKey, doneMethod);
    }
    public KeyDown(keyboardKey: IKeyboardKey, doneMethod) {
        this.post("KeyDown", keyboardKey, doneMethod);
    }
    public KeyRawUp(data: number[],withBreak: boolean, doneMethod) {
        this.post("KeyRawUp?withBreak=" + withBreak, data, doneMethod);
    }
    public KeyRawDown(data: number[], doneMethod) {
        this.post("KeyRawDown", data, doneMethod);
    }
    public VideoMemoryDump(doneMethod: (m:IMemoryDump[]) => void) {
        this.callApi("VideoMemoryDump", doneMethod);
    }

    public static ServiceName: ServiceName = { Name: "ComputerService" };
}