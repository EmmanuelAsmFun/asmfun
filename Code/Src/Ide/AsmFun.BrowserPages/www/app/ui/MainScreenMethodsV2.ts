// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

// TODO : clean up this mess

import { AsmTools } from "../Tools.js"

import { MainScreenMethods } from "./MainScreenMethods.js";
import { IEditorLine, IEditorLabel } from "../features/editor/data/EditorData.js";
import { ProcessorManager } from "../features/processor/ProcessorManager.js";
import { ASMFunPlayerManager } from "../features/player/ASMFunPlayerManager.js";


    // Todo: Clean this mess up

    export function SourCodeLineClick(evt: any) {
        (<any>window).moveTheCursor(evt);
        return true;
    }

    export function CheckPlayerAvailable() {
        var svc = MainScreenMethods.S.mainData.container.Resolve<ASMFunPlayerManager>(ASMFunPlayerManager.ServiceName);
        if (svc == null) return;
        svc.CheckPlayerAvailable(() => { }, () => { }, false);
    }

    // Todo : clean this up with commands
    export function SwapChangeLabelValue(line: IEditorLine) {
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
    export function ChangeLabelValue(e: KeyboardEvent, label: IEditorLabel) {

        if (e.keyCode === 13) {
            console.log("ChangeLabelValue:" + label.data.name + " = " + label.newValue);
            if (label.newValue == null || label.newValue === "") return;
            var newValue = AsmTools.hexToNum(label.newValue);
            if (newValue == label.data.value) return;
            MainScreenMethods.S.mainData.container.Resolve<ProcessorManager>(ProcessorManager.ServiceName)?.ChangeLabelValue(label, newValue);
            label.isInEditMode = false;
            MainScreenMethods.S.SetEditorEnable(true);
            e.stopPropagation();
            e.preventDefault();
            e.returnValue = false;
            e.cancelBubble = true;
            return false;
        }
        else if (e.keyCode === 27) {
            label.isInEditMode = false;
            MainScreenMethods.S.SetEditorEnable(true);
            e.stopPropagation();
            e.preventDefault();
            e.returnValue = false;
            e.cancelBubble = true;
            return false;
        }

    }


 
 

//var MainScreenMethods = 

//    static ExecuteCommand(command: IBaseCommand) {
//        MainScreenMethods.S.mainData.commandManager.InvokeCommand(command);
//    }

