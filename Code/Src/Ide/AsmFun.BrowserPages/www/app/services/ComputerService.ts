// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { ApiService } from "./ApiService.js";
import { IPropertyData } from "../data/EditorData.js";
import { IKeyboardKey } from "../data/ComputerData.js";
import { ServiceName } from "../serviceLoc/ServiceName.js";



export class ComputerService extends ApiService {
  

    constructor() {
        super();
        this.controllerName = "computer";
    }

    public getData(doneMethod) {
        this.callApi("getData", doneMethod);
    }

    public StartComputer(doneMethod) {
        this.callApi("StartComputer", doneMethod);
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

    public getStack(doneMethod) {
        this.callApi("getStack", doneMethod);
    }

    public getLabels(doneMethod) {
        this.callApi("getLabels", doneMethod);
    }

    public getLabelValues(properties: IPropertyData[], doneMethod) {
        this.post("getLabelValues", properties, doneMethod);
    }

    public getProcessorState(doneMethod) {
        this.callApi("getProcessorState", doneMethod);
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

    public static ServiceName: ServiceName = { Name: "ComputerService" };
}