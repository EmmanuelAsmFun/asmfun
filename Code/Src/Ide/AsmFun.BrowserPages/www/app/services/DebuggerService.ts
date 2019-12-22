// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { ApiService } from "./ApiService.js";
import { ServiceName } from "../serviceLoc/ServiceName.js";


export class DebuggerService extends ApiService {

    constructor() {
        super();
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

    public static ServiceName: ServiceName = { Name: "DebuggerService" };
}