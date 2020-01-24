// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import { ApiService } from "./ApiService.js";
import { ServiceName } from "../serviceLoc/ServiceName.js";
import { IEventManager } from "../framework/IAsmFunEventManager.js";
import { IMainData } from "../data/MainData.js";


export class DebuggerService extends ApiService {

    private eventManager: IEventManager

    constructor(mainData: IMainData) {
        super();
        this.eventManager = mainData.eventManager;
        this.controllerName = "debugger";
    }

    public getDisassembly(start, length, doneMethod) {
        this.callApi("GetDisassembly?start=" + start + "&length=" + length, doneMethod);
    }

    public nextStep(doneMethod) {
        this.callApi("NextStep", doneMethod);
    }

    public changeLabelValue(name:string,newValue:number,doneMethod) {
        this.callApi("ChangeLabelValue?name=" + encodeURI(name)+"&newValue=" + newValue, doneMethod);
    }

    public stepOver(doneMethod) {
        this.callApi("StepOver", doneMethod);
    }

    public run(doneMethod) {
        this.callApi("Run", doneMethod);
    }

    public setBreakpoint(index,address, state, doneMethod) {
        this.callApi("SetBreakpoint?index="+index+"&address=" + address + "&state=" + state, doneMethod);
    }

    public getBreakPoints(doneMethod) {
        this.callApi("GetBreakPoints", doneMethod);
    }

    public getMemoryBlock(startAddress: number, count: number,doneMethod) {
        this.callApi("GetMemoryBlock?startAddress="+startAddress+"&count="+count, doneMethod);
    }
    public WriteMemoryBlock(startAddress: number, data: any, count: number, doneMethod) {
        this.post("WriteMemoryBlock", { startAddress: startAddress, data: btoa(String.fromCharCode.apply(null, data)), count: count }, doneMethod);
    }
    public WriteVideoMemoryBlock(startAddress: number, data: any, count: number, doneMethod) {
        this.post("WriteVideoMemoryBlock", { startAddress: startAddress, data: btoa(String.fromCharCode.apply(null, data)), count: count }, doneMethod);
    }

    public static ServiceName: ServiceName = { Name: "DebuggerService" };
}