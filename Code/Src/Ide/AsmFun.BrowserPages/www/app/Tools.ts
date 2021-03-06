﻿// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

export class AsmTools {
    public static Base64Decode(data: string) {
        var numBytes = Uint8Array.from(atob(data), c => c.charCodeAt(0))
        return numBytes;
    }

    /// if parse one byte , Use isBigEndian to true, it's more performant.
    public static ConvertToNumber(data: string, isBigEndian: boolean): number {
        data = data.trim();
        if (data.length < 2) return Number(data);
        switch (data[0]) {
            case "$":
                var datas = data.substring(1);

                // hexdecimal value
                if (isBigEndian)
                    return parseInt(datas, 16);
                else {
                    var temp = datas.replace(" ","").match(/[0-9a-fA-F]{2}/g);
                    if (temp == null) return 0;
                    return parseInt(temp.reverse().join(''), 16);
                }
                
            case "%": // binary value
                return parseInt(data.substring(1).replace(".","0").replace("#","1"), 2);
            case "&": // octal value
                return parseInt(data.substring(1),8);
        }
        if (data[0] === "0" && data[""] === "x") {
            // hex value
            if (isBigEndian) {
                return parseInt(data, 16);
            } else
                return parseInt((<any>data.match(/../g)).reverse().join(''));
        }
        if (data[0] === "0" && data[""] === "b") {
            return parseInt(data.substring(1), 2); // binary value
        }
        try {
            // decimal value
            return parseInt(data);
        } catch (e) {
            return 0;
        }
    }

    public static numToStringChar(val: number): string {
        if (val < 32) return ".";
        if (val === 60) return "&lt;";
        if (val === 62) return "&gt;";
        return String.fromCharCode(val);
    }
    public static numToHex5(val: number): string {
        var address = val.toString(16);
        if (address.length < 5)
            address = "0" + address;
        if (address.length < 5)
            address = "0" + address;
        if (address.length < 5)
            address = "0" + address;
        if (address.length < 5)
            address = "0" + address;
        return address.toUpperCase();;
    }
    public static numToHex4(val: number): string {
        var address = val.toString(16);
        if (address.length < 4)
            address = "0" + address;
        if (address.length < 4)
            address = "0" + address;
        if (address.length < 4)
            address = "0" + address;
        return address.toUpperCase();;
    }
    public static numToHex2(val: number):string {
        var address = val.toString(16);
        if (address.length < 2)
            address = "0" + address;
        return address.toUpperCase();;
    }
    public static numToHex(val:number,dataLength:number): string {
        var hex = val.toString(16);
        var startLength = hex.length;
        for (var i = startLength; i < dataLength*2; i++) 
            hex = "0" + hex;
        return hex.toUpperCase();
}
    public static hexToNum(value: string) {
        return parseInt(value, 16);
    }
    public static ArrayToHexString(data: Uint8Array) {
        var rawDataString = "";
        data.forEach(x => rawDataString += AsmTools.numToHex2(x) + ",");
        rawDataString = rawDataString.substring(0, rawDataString.length - 1);
        return rawDataString;
    }

    public static scrollIntoViewIfOutOfView(elementId, directScroll:boolean = false) {
        setTimeout(() => {
            var ell = document.getElementById(elementId);
            if (ell == null) return;
            if (directScroll)
                ell.scrollIntoView({ behavior: "auto", block: "nearest", });
            else {
                ell.scrollIntoView({ behavior: "smooth", block: "start", });
                setTimeout(() => {
                    if (ell == null) return;
                    ell.scrollIntoView({ behavior: "auto", block: "nearest", });
                }, 300);
            }
        } ,10);
    }
    public static scrollIntoViewWithParent(elementId, parentElementId:string, directScroll: boolean = false) {
        setTimeout(() => {
            var ell = document.getElementById(elementId);
            if (ell == null) return;
            if (directScroll) {
                ell.scrollIntoView({ behavior: "auto", block: "nearest", });
                var sc = document.getElementById(parentElementId);
                if (sc == null) return;
                var bounds = ell.getBoundingClientRect();
                var top = bounds.top;
                if (top < 80 && top >= 0)
                    sc?.scrollBy(0, -80);
                else if (top > 800)
                    sc?.scrollBy(0, 80);
            }
            else {
                ell.scrollIntoView({ behavior: "smooth", block: "start", });
                setTimeout(() => {
                    if (ell == null) return;
                    ell.scrollIntoView({ behavior: "auto", block: "nearest", });
                    var sc = document.getElementById(parentElementId);
                    if (sc == null) return;
                    var bounds = ell.getBoundingClientRect();
                    var top = bounds.top;
                    if (top < 80 && top >= 0)
                        sc?.scrollBy(0, -80);
                    else if (top > 800)
                        sc?.scrollBy(0, 80);
                }, 300);
            }
        } ,10);
    }

    public static GetAbsPosition = function (el) {
        var el2 = el;
        var curtop = 0;
        var curleft = 0;
        if (document.getElementById || document.all) {
            do {
                curleft += el.offsetLeft - el.scrollLeft;
                curtop += el.offsetTop - el.scrollTop;
                el = el.offsetParent;
                el2 = el2.parentNode;
                while (el2 != el) {
                    curleft -= el2.scrollLeft;
                    curtop -= el2.scrollTop;
                    el2 = el2.parentNode;
                }
            } while (el.offsetParent);

        } else if ((<any>document).layers) {
            curtop += el.y;
            curleft += el.x;
        }
        return [curtop, curleft];
    };

    public static EnumToArray(enumType) {
        return Object.keys(enumType)
            .filter(key => typeof enumType[key] !== 'number')
            .map(key => enumType[key]);
    }

    public static async CopyToClipBoard(text: string) {
        try {
            const toCopy = text || location.href;
            await navigator.clipboard.writeText(toCopy);
            console.log('Text or Page URL copied');
        }
        catch (err) {
            console.error('Failed to copy: ', err);
        }
    }

    public static async CopyToClipBoardSelected() {
        if (document == null) return;
        document.execCommand('copy');                   // Copy - only works as a result of a user action (e.g. click events)
    }

   
}

export class AsmString {
    public static  CompareInsensitive(str2: string, str1: string) {
        return new RegExp(str1, "gi").test(str2);
    }

    public static CleanSearch(str1: string) {
        return str1.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    }
}

export class ASMStorage {
    public static StoreGetProp<T>(name: string): T | null {
        var name = name.replace(/[^a-zA-Z .]/g, "");
        var data = localStorage.getItem(name);
        if (data == null) return null;
        return JSON.parse(data);
    }

    public static StoreSetProp<T>(name: string, obj: T) {
        var name = name.replace(/[^a-zA-Z .]/g, "");
        var data = JSON.stringify(obj)
        localStorage.setItem(name, data);
    }

    public static SaveDataToFile(content, fileName: string = "MemoryDump.bin", contentType: string = "application/octet-stream") {
        var a = document.createElement("a");
        var file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }

    public static GetNowForFile() {
        var today = new Date();
        var y = today.getFullYear().toString();
        var m = (today.getMonth() + 1).toString();
        var d = today.getDate().toString();
        var h = today.getHours().toString();
        var mi = today.getMinutes().toString();
        var s = today.getSeconds().toString();
        return y + m + d + "-" + h  + mi + s;
    }

    public static HumanFileSize(size: number):string {
        if (size < 1024) return size + ' B'
        let i = Math.floor(Math.log(size) / Math.log(1024))
        var num = <any>(size / Math.pow(1024, i))
        let round = Math.round(num)
        num = round < 10 ? num.toFixed(2) : round < 100 ? num.toFixed(1) : round
        return `${num} ${'KMGTPEZY'[i - 1]}B`
    }
}