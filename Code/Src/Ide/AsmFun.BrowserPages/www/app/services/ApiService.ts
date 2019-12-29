// #region license
// ASM Fun
// Copyright (c) 2019-2030 Emmanuel from ASMFun. Read the license file.
//
// #endregion

export class ApiService {

    public controllerName: string = "";
    private fetchoptions: any;
    private fetchoptionsPost: any;
    public static ServerAddress: string = "";

    constructor() {
        this.fetchoptions = {
            method: 'GET', // *GET, POST, PUT, DELETE, etc.
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow', // manual, *follow, error
        }; 
        this.fetchoptionsPost = {
            method: 'POST', // *GET, POST, PUT, DELETE, etc.
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *same-origin, omit
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow', // manual, *follow, error
        };
    }

    
    public callApi(action, doneMethod, error?: (e) => void) {
        var uri = "/api/" + this.controllerName + "/" + action;
        if (uri.indexOf('?') > -1)
            uri += "&t=" + Math.random().toPrecision(10);
        else
            uri += "?t=" + Math.random().toPrecision(10);
        fetch(ApiService.ServerAddress + "/api/" + this.controllerName + "/" + action, this.fetchoptions)
            .then((response) => {
                if (!response) return;
                // handle success
                // not using Json directly to avoid breakpoint on debug.
                response.text().then(data => {
                    if (data == null || data.length === 0 || (data[0] !== "{" && data[0] !== "[")) {
                        if (error != null)
                            error(data);
                        return;
                    }
                    if (doneMethod) doneMethod(JSON.parse(data));
                }).catch(r => {
                    console.error("Error fetch json " + uri, r);
                    if (error != null)
                        error(r);
                });
            }, er => {
                    console.error("Error calling " + uri, er);
                if (error != null)
                    error(er);
            });
    }
    public callApiCurrentDomain(action, doneMethod, error?: (e) => void) {
        var uri = "/api/" + this.controllerName + "/" + action;
        if (uri.indexOf('?') > -1)
            uri += "&t=" + Math.random().toPrecision(10);
        else
            uri += "?t=" + Math.random().toPrecision(10);
        fetch( "/api/" + this.controllerName + "/" + action, this.fetchoptions)
            .then((response) => {
                if (!response) return;
                // handle success
                // not using Json directly to avoid breakpoint on debug.
                response.text().then(data => {
                    if (data == null || data.length === 0 || (data[0] !== "{" && data[0] !== "[")) {
                        if (error != null)
                            error(data);
                        return;
                    }
                    if (doneMethod) doneMethod(JSON.parse(data));
                }).catch(r => {
                    console.error("Error fetch json " + uri, r);
                    if (error != null)
                        error(r);
                });
            }, er => {
                    console.error("Error calling " + uri, er);
                if (error != null)
                    error(er);
            });
    } 
    public post(action, data, doneMethod, error?: (e) => void) {
        var jsonData = JSON.stringify(data)
        var uri = "/api/" + this.controllerName + "/" + action;
        if (uri.indexOf('?') > -1)
            uri += "&t=" + Math.random().toPrecision(10);
        else
            uri += "?t=" + Math.random().toPrecision(10);
        this.fetchoptionsPost.body = jsonData;
        fetch(ApiService.ServerAddress + "/api/" + this.controllerName + "/" + action, this.fetchoptionsPost)
            .then((response) => {
                if (!response) return;
                // handle success
                response.json().then(data => {
                    if (doneMethod) doneMethod(data);
                }).catch(r => {
                    console.error("Error post fetch json " + uri, r);
                    if (error != null)
                        error(r);
                });
            }).catch(err => {
                console.error("Error posting " + uri, err);
                if (err.text) {
                    err.text().then(errorMessage => {
                        if (error != null)
                            error(errorMessage);
                    })
                } else {
                    if (error != null)
                        error(err);
                }
            });
    }



}