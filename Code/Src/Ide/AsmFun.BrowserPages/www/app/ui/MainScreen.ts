// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import Vue from "../../lib/vue.esm.browser.min.js"
import { AsmTools } from "../Tools.js"
import { ServiceRegisterer } from "../ServiceRegisterer.js";
import { KeyboardKeyCommand, EditorCodeAssistCommand, EditorPasteCommand } from "../data/commands/EditorCommands.js";
import { ProjectSaveCommand } from "../data/commands/ProjectsCommands.js";
import { MainScreenMethods } from "./MainScreenMethods.js";
import { myEditableFieldInit } from "./EditableField.js";
import { IKeyboardKey } from "../data/ComputerData.js";
import { ASMFunPlayerManager } from "../Core/AsmFunPlayerManager.js";
import { ComputerManager } from "../core/ComputerManager.js";
import { ProjectManager } from "../core/ProjectManager.js";
import { EditorManager } from "../core/EditorManager.js";

// Initialize base objects
var reg = new ServiceRegisterer();
reg.Register();
export var myMainData = reg.myMainData;



// Create main vue
var myRootV = new Vue({
    el: '#app',
    data: reg.myAppData,
    methods: reg.mainScreenMethods,
    filters: {
        toHex1: function (value) {
            if (!value) return '00'
            return AsmTools.numToHex2(value);
        },
        toHex2: function (value) {
            if (!value) return '0000'
            return AsmTools.numToHex4(value);
        },
        toStr: function (value) {
            if (!value) return '.'
            if (value < 0x20) return '.'
            return String.fromCharCode(value);
        }
    }
});
myEditableFieldInit(myRootV);

reg.Init();

// Program start
reg.myMainData.container.Resolve<ASMFunPlayerManager>(ASMFunPlayerManager.ServiceName)?.Launch();





// --------------------------------------
// TODO : clean up this mess, move them all to correxponding classes.


(<any>Vue).config.devtools = true;
var scStartPosX = 0;
var scStartPosY = 0;
(<any>window).moveTheCursor = function (evt) {
    var editorManager = reg.myMainData.container.Resolve<EditorManager>(EditorManager.ServiceName);
    if (editorManager == null) return;
    var sc = document.getElementById('sourceCode');
    if (sc == null) return;
    if (scStartPosX == 0) {
        var rect = sc.getBoundingClientRect();
        scStartPosX = rect.left;
        scStartPosY = rect.top;
    }
    // console.log(evt.clientX, evt.clientY, evt.pageX, evt.pageY);
    var xOffset = evt.pageX - scStartPosX - 115 + sc.scrollLeft;
    var yOffset = evt.pageY - scStartPosY + sc.scrollTop;
    var xPos = Math.ceil(xOffset / editorManager.editorData.charWidth);
    var yPos = Math.ceil(yOffset / editorManager.editorData.charHeight) - 2;
    // console.log(xOffset + "x" + yOffset, xPos + "x" + yPos);
    editorManager.MoveCursor(xPos, yPos);
    var domObj = document.getElementById('MyCursor');
    if (domObj != null && domObj.style != null && domObj.style !== undefined) {
        // restart cursor animation
        domObj.classList.remove("myCursorA");
        void domObj.offsetWidth;
        domObj.classList.add("myCursorA");

    }
};
(<any>window).onbeforeunload = function () {
    var editorManager = reg.myMainData.container.Resolve<EditorManager>(EditorManager.ServiceName);
    if (editorManager != null && editorManager.requireSave) {
        return 'Changes have not been saved. Are you sure?'
    }
    return null;
};

(<any>window).jumpToZone = function (htmlObj, evt, labelName, ignoreCTRLkey = false) {
    if (!myMainData.ctrlKeyIsDown && !ignoreCTRLkey) return;
    var editorManager = reg.myMainData.container.Resolve<EditorManager>(EditorManager.ServiceName);
    if (editorManager == null) return;
    console.log("jumpToZone:" + labelName + ":ctrlDown=" + myMainData.ctrlKeyIsDown);
    (<any>window).moveTheCursor(htmlObj, evt);
    editorManager.NavigateToZone(labelName.substring(2));
    setTimeout(() => {
        AsmTools.scrollIntoViewIfOutOfView(labelName);
    }, 50);

};
(<any>window).jumpToMacro = function (htmlObj, evt, name, ignoreCTRLkey = false) {
    if (!myMainData.ctrlKeyIsDown && !ignoreCTRLkey) return;
    var editorManager = reg.myMainData.container.Resolve<EditorManager>(EditorManager.ServiceName);
    if (editorManager == null) return;
    console.log("jumpToMacro:" + name + ":ctrlDown=" + myMainData.ctrlKeyIsDown);
    (<any>window).moveTheCursor(htmlObj, evt);
    editorManager.NavigateToMacro(name.substring(2));
};
(<any>window).jumpToVar = function (htmlObj, evt, labelName, ignoreCTRLkey = false) {
    if (!myMainData.ctrlKeyIsDown && !ignoreCTRLkey) return;
    console.log("jumpToVar:" + labelName + ":ctrlDown=" + myMainData.ctrlKeyIsDown);
    setTimeout(() => {
        AsmTools.scrollIntoViewIfOutOfView(labelName);
    }, 50);
};

(<any>window).MemoryItemHover = function (index: number, address: number, value: number) {
    if (MainScreenMethods != null && MainScreenMethods.S != null)
        MainScreenMethods.S.MemoryItemHover(index, address, value);
};





document.onkeyup = function (e) {
    myMainData.ctrlKeyIsDown = e.ctrlKey;
    if (myMainData.appData.computer.isDetailVisible) {
        var svc = reg.myMainData.container.Resolve<ComputerManager>(ComputerManager.ServiceName);
        if (svc == null) return;
        var keyy: IKeyboardKey = {
            key: e.key, which: e.which, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey
        }
        return svc.KeyUp(keyy);
    }
}
document.onkeydown = function (e) {
    // z = 90       e = 69      r = 82      t = 84      d = 68  b = 66
    // e.altKey e.ctrlKey
    // console.log(e.which);
    if (myMainData.appData.computer.isDetailVisible) {
        var svc = reg.myMainData.container.Resolve<ComputerManager>(ComputerManager.ServiceName);
        if (svc == null) return;
        var keyy: IKeyboardKey = {
            key: e.key, which: e.which, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey
        }
        return svc.KeyDown(keyy);
    }
    var editorManager = reg.myMainData.container.Resolve<EditorManager>(EditorManager.ServiceName);
    if (!editorManager?.GetIsEnabled()) return;

    var handled = false;
    myMainData.ctrlKeyIsDown = e.ctrlKey;
    if (e.ctrlKey) {

        if (e.which === 32) {
            // CTRL + space
            handled = sendCommand(new EditorCodeAssistCommand());
        }

        if (e.which === 83) {
            console.log("save project");
            // CTRL + S
            if (myMainData.sourceCode != null) {
                sendCommand(new ProjectSaveCommand(myMainData.sourceCode));
                handled = true;
            }
        }
    }
    switch (e.which) {
        case 113: reg.mainScreenMethods.DbResetPc(); handled = true; break;       // F2
        case 116: reg.mainScreenMethods.DbgRun(); handled = true; break;       // F5
        case 121: reg.mainScreenMethods.DbgStepOver(); handled = true; break;  // F10
        case 122: reg.mainScreenMethods.DbgNextStep(); handled = true; break;  // F11
    }
    if (!handled) {
        var keyCommand = new KeyboardKeyCommand();
        keyCommand.key = e.key;
        keyCommand.which = e.which;
        keyCommand.ctrlKey = e.ctrlKey;
        keyCommand.altKey = e.altKey;
        keyCommand.shiftKey = e.shiftKey;
        myMainData.commandManager.InvokeCommand(keyCommand);

        var domObj = document.getElementById('MyCursor');
        if (domObj != null && domObj.style != null && domObj.style !== undefined) {
            // restart cursor animation
            domObj.classList.remove("myCursorA");
            void domObj.offsetWidth;
            domObj.classList.add("myCursorA");
        }
        if (e.key === "v") {
            paste(null);
            return;
        }
        // myRootV.$forceUpdate()
        handled = !keyCommand.allowContinueEmit;
    }
    if (handled) {
        e.stopPropagation();
        e.preventDefault();
        e.returnValue = false;
        e.cancelBubble = true;
        return false;
    }


};

function sendCommand(command) {
    myMainData.commandManager.InvokeCommand(command);
    return command.allowContinueEmit;
}

var systemPasteReady = false;
var systemPasteContent = "";
function paste(target2) {
    console.log("paste");
    var textArea;
    function waitForPaste() {
        if (textArea.value == null || textArea.value === "") {
            setTimeout(waitForPaste, 50);
            return;
        }
        sendCommand(new EditorPasteCommand(textArea.value))
        systemPasteReady = false;
        document.body.removeChild(textArea);
        textArea = null;
    }
    // FireFox requires at least one editable
    // element on the screen for the paste event to fire
    textArea = document.createElement('textarea');
    textArea.setAttribute('style', 'width:1;height:1;position:fixed;z-index:889;border:0;opacity:0;');
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    waitForPaste();
}




