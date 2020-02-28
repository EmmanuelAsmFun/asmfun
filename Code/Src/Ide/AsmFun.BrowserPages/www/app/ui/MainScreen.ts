// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

import Vue from "../../lib/vue.esm.browser.min.js"
import { AsmTools } from "../Tools.js"
import { ServiceRegisterer } from "../ServiceRegisterer.js";
import { KeyboardKeyCommand, EditorCodeAssistCommand, EditorPasteCommand } from "../features/editor/commands/EditorCommands.js";
import { ProjectSaveCommand } from "../features/project/commands/ProjectsCommands.js";
import { myEditableFieldInit } from "./EditableField.js";
import { IKeyboardKey } from "../features/computer/data/ComputerData.js";
import { ASMFunPlayerManager } from "../features/player/ASMFunPlayerManager.js";
import { EditorManager } from "../features/editor/EditorManager.js";
import { VideoManager } from "../features/video/VideoManager.js";
import { MemoryItemHoverCommand } from "../features/memory/commands/MemoryCommands.js";
import { MemoryEdit } from "../features/memory/MemoryMethods.js";

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

reg.Start();



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
    editorManager.MoveCursor(xPos, yPos, false);
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
        AsmTools.scrollIntoViewWithParent(labelName, "sourceCode");
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
        AsmTools.scrollIntoViewWithParent(labelName, "sourceCode");
    }, 50);
};

(<any>window).MemoryItemHover = function (index: number, address: number, value: number) {
    if (myMainData != null)
        myMainData.commandManager.InvokeCommand(new MemoryItemHoverCommand(index, address, value));
};
(<any>window).MemoryEdit = function (address: number, el?: HTMLElement) {
    if (myMainData != null) 
        myMainData.commandManager.InvokeCommand(new MemoryEdit(address, el));
};



document.onkeyup = function (e) {
    myMainData.ctrlKeyIsDown = e.ctrlKey;
    var svc = reg.myMainData.container.Resolve<VideoManager>(VideoManager.ServiceName);
    if (svc == null || !svc.data.isVisible) return;
    var keyy: IKeyboardKey = {
        key: e.key, which: e.which, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey
    }
    return svc.KeyUp(keyy);
}
document.onkeydown = function (e) {
    // z = 90       e = 69      r = 82      t = 84      d = 68  b = 66
    // e.altKey e.ctrlKey

    //console.log(e.which);
    
    var svc = reg.myMainData.container.Resolve<VideoManager>(VideoManager.ServiceName);

    if (svc != null && svc.data.isVisible) {
        var keyy: IKeyboardKey = {
            key: e.key, which: e.which, ctrlKey: e.ctrlKey, shiftKey: e.shiftKey, altKey: e.altKey
        }
        return svc.KeyDown(keyy);
    }
    // var editorManager = reg.myMainData.container.Resolve<EditorManager>(EditorManager.ServiceName);
    //if (!editorManager?.GetIsEnabled()) return;

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
            sendCommand(new ProjectSaveCommand());
            handled = true;
            
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
        if (e.key === "v" && e.ctrlKey) {
            var editorManager = reg.myMainData.container.Resolve<EditorManager>(EditorManager.ServiceName);
            if (editorManager != null && editorManager.data.isTextEditorInFocus) {
                paste(null);
                return;
            }
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




