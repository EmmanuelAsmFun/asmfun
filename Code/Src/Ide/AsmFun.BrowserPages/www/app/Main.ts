// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
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
  

