// #region license
// ASM Fun
// Copyright (c) 2013-2020 Emmanuel from ASMFun.
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
    
    public static scrollIntoViewIfOutOfView(el, directScroll:boolean = false) {
        setTimeout(() => {
            var ell = document.getElementById(el);
            if (ell == null) return;
            if (directScroll)
                ell.scrollIntoView({ behavior: "auto", block: "nearest", });
            else
                ell.scrollIntoView({ behavior: "smooth", block: "start", });
        } ,10);
    //var element = $(el);
    //var topp = $(window).scrollTop();
    //var offset = element.offset().top - 50;
    //if (topp > offset || offset > topp + 1000) {
    //    $('html, body').animate({ scrollTop: offset }, { duration: 400 });
    //}
    }
}