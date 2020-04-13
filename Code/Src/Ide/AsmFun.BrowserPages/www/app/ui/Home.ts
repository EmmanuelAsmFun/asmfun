import Vue from "../../lib/vue.esm.browser.min.js"


export interface IAsmFunIdeData {
    showDownloads: boolean;
    hasConfirmedLicense: boolean;
    isWindows: boolean;
    isMac: boolean;
    isLinux: boolean;
    isVisible: boolean;
    showMoreDownloads: boolean;
    Start: () => void,
}
var data: IAsmFunIdeData = {
    isVisible:false,
    hasConfirmedLicense: false,
    isLinux: false,
    isMac: false,
    isWindows: false,
    showDownloads: false,
    showMoreDownloads: false,
    Start: () => {},
}

enum BrowserTypes {
    Unknown,
    Windows,
    iOS,
    MacOS,
    Linux,
    Android
}


class Home {
    private data: IAsmFunIdeData;
    constructor(data: IAsmFunIdeData) {
        this.data = data;
        this.data.Start = () => this.Start();
        var os = this.GetOS();
        if (os === BrowserTypes.Windows) this.data.isWindows = true;
        else if (os === BrowserTypes.MacOS || os === BrowserTypes.iOS) this.data.isMac = true;
        else if (os === BrowserTypes.Android || os === BrowserTypes.Linux) this.data.isLinux = true;
    }

    public SelectOS(osName: string) {
        this.ClearOS();
        switch (osName) {
            case "Windows": this.data.isWindows = true; return;
            case "Mac": this.data.isMac = true; return;
            case "Linux": this.data.isLinux = true; return;
        }
        // default value
        this.data.isWindows = true;
    }

    private ClearOS() {
        this.data.isWindows = false;
        this.data.isMac = false;
        this.data.isLinux = false;
    }

   
    private GetOS(): BrowserTypes {
        var userAgent = window.navigator.userAgent;
        var platform = window.navigator.platform;
        var macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
        var windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
        var iosPlatforms = ['iPhone', 'iPad', 'iPod'];

        if (macosPlatforms.indexOf(platform) !== -1)
            return BrowserTypes.MacOS;
        else if (iosPlatforms.indexOf(platform) !== -1)
            BrowserTypes.iOS;
        else if (windowsPlatforms.indexOf(platform) !== -1)
            return BrowserTypes.Windows;
        else if (/Android/.test(userAgent))
            return BrowserTypes.Android;
        else if (/Linux/.test(platform))
            return BrowserTypes.Linux;

        return BrowserTypes.Unknown;
    }

    public Start() {
        document.location.href = "/for-commander-x16/index.html?popup=Downloads";
    }
}



var home = new Home(data);

var myRootV = new Vue({
    el: '#appHome',
    data: {
        ide: data,
    },
    methods: {},


});
(<any>window).ASMFunPlayerSelectOS = (os) => home.SelectOS(os);
