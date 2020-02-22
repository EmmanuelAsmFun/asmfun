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
import { IUILine } from "../features/editor/ui/IUILine.js";
import { IUIProperty } from "../features/editor/data/IPropertiesData.js";


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
export function SwapChangeLabelValue(prop: IUIProperty) {
    
        if (prop == null) return;
        if (MainScreenMethods.S.lastEditedLabel != null &&
            MainScreenMethods.S.lastEditedLabel.IsInEditMode === true) {
            MainScreenMethods.S.lastEditedLabel.IsInEditMode = false;
        }
        prop.IsInEditMode = !prop.IsInEditMode;
        if (prop.IsInEditMode) {
            prop.NewValue = prop.Value;
        }
    MainScreenMethods.S.lastEditedLabel = prop;
        setTimeout(() => {
            var el = document.getElementById('labelEdit' + prop.LineNumber);
            if (el != null)
                el.focus();
        }, 50);
    }
export function ChangeLabelValue(e: KeyboardEvent, prop: IUIProperty) {
        if (prop == null) return;
        var label = prop;
        if (e.keyCode === 13) {
            //console.log("ChangeLabelValue:" + label.data.name + " = " + label.newValue);
            if (label.NewValue == null || label.NewValue === "") return;
            var newValue = AsmTools.hexToNum(label.NewValue);
            var oldValue = AsmTools.hexToNum(label.Value);
            if (newValue == oldValue) return;
            MainScreenMethods.S.mainData.container.Resolve<ProcessorManager>(ProcessorManager.ServiceName)?.ChangeLabelValue(prop, newValue);
            label.IsInEditMode = false;
            e.stopPropagation();
            e.preventDefault();
            e.returnValue = false;
            e.cancelBubble = true;
            return false;
        }
        else if (e.keyCode === 27) {
            label.IsInEditMode = false;
            e.stopPropagation();
            e.preventDefault();
            e.returnValue = false;
            e.cancelBubble = true;
            return false;
        }

    }



