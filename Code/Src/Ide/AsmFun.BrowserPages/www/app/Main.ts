// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
//
// #endregion

import { myMainData } from "./ui/MainScreen.js";
if (document.location.protocol != 'https:' && document.location.host.indexOf("localhost") < 0) {
    document.location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
}
    try {
        console.log("start");
        var test = myMainData;
    } catch (e) {
        console.error("Error on start :",e);
    }
  

