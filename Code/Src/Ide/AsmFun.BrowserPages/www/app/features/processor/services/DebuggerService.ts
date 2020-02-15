import { ApiService } from "../../../framework/services/ApiService.js";
import { IEventManager } from "../../../framework/IAsmFunEventManager.js";
import { IMainData } from "../../../framework/data/MainData.js";
import { ServiceName } from "../../../framework/serviceLoc/ServiceName.js";
import { ProcessorBreakPointsChanged } from "../commands/ProcessorCommands.js";
import { IDebuggerBreakpoint } from "../data/BreakPointsData.js";

// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion



export class DebuggerService extends ApiService {

    private eventManager: IEventManager

    constructor(mainData: IMainData) {
        super();
        this.eventManager = mainData.eventManager;
        this.controllerName = "debugger";
    }

    public GetDisassembly(start, length, doneMethod) {
        this.callApi("GetDisassembly?start=" + start + "&length=" + length, doneMethod);
    }

    public NextStep(doneMethod) {
        this.callApi("NextStep", doneMethod);
    }

    public ChangeLabelValue(name:string,newValue:number,doneMethod) {
        this.callApi("ChangeLabelValue?name=" + encodeURI(name)+"&newValue=" + newValue, doneMethod);
    }

    public StepOver(doneMethod) {
        this.callApi("StepOver", doneMethod);
    }

    public Run(doneMethod) {
        this.callApi("Run", doneMethod);
    }

    public SetBreakpoint(index: number,address: number, state: boolean, isEnabled:boolean, doneMethod) {
        this.callApi("SetBreakpoint?index=" + index + "&address=" + address + "&state=" + state + "&isEnabled=" + isEnabled, () => {
            doneMethod();
        });
    }

    public GetBreakPoints(doneMethod: (r: IDebuggerBreakpoint[]) => void) {
        this.callApi("GetBreakPoints", (result) => {
            doneMethod(result);
            this.eventManager.InvokeEvent(new ProcessorBreakPointsChanged(result));
        });
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