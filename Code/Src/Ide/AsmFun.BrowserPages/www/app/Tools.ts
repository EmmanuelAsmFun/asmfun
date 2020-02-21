// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

export class AsmTools {

    public static ConvertToNumber(data: string, isBigEndian: boolean): number {
        data = data.trim();
        if (data.length < 2) return Number(data);
        switch (data[0]) {
            case "$":
                var datas = data.substring(1);
                // hexdecimal value
                if (isBigEndian) {
                    return parseInt(datas, 16);
                } else {
                    var temp = (<any>datas.match(/../g));
                    if (temp == null) return 0;
                    return parseInt(temp.reverse().join(''));
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
    public static numToHex5(val): string {
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
    public static numToHex4(val): string {
        var address = val.toString(16);
        if (address.length < 4)
            address = "0" + address;
        if (address.length < 4)
            address = "0" + address;
        if (address.length < 4)
            address = "0" + address;
        return address.toUpperCase();;
    }
    public static numToHex2(val):string {
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
                    ell.scrollIntoView({ behavior: "auto", block: "nearest", })
                }, 300);
            }
        } ,10);
    //var element = $(el);
    //var topp = $(window).scrollTop();
    //var offset = element.offset().top - 50;
    //if (topp > offset || offset > topp + 1000) {
    //    $('html, body').animate({ scrollTop: offset }, { duration: 400 });
    //}
    }

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