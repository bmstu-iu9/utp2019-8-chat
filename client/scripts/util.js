'use strict'

const getCookie = (name) => {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

const setCookie = (name, value, options = {}) => {
    options = {
        path: '/',
        ...options
    };
    if (options.expires && options.expires.toUTCString) {
        options.expires = options.expires.toUTCString();
    }
    let updatedCookie = encodeURIComponent(name) + "=" + encodeURIComponent(value);
    for (let optionKey in options) {
        updatedCookie += "; " + optionKey;
        let optionValue = options[optionKey];
        if (optionValue !== true) {
            updatedCookie += "=" + optionValue;
        }
    }
    document.cookie = updatedCookie;
}

const deleteCookie = (name) => {
    setCookie(name, "", { 'max-age': -1 });
}

const request = (dest, params) => {
    return new Promise((resolve, reject) => {
        const encodeMessage = (str) => { //Replace special charasters to codes
            return str.toString().
                replace(/\$/g, "%24").
                replace(/\&/g, "%26").
                replace(/\+/g, "%2b").
                replace(/\,/g, "%2c").
                replace(/\//g, "%2f").
                replace(/\:/g, "%3a").
                replace(/\;/g, "%3b").
                replace(/\=/g, "%3d").
                replace(/\?/g, "%3f").
                replace(/\@/g, "%40");
        }
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                return resolve({ response: xhr.responseText, status: xhr.status });
            }
        }
        xhr.open('POST', dest, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        let paramStr = [];
        for (let key in params) {
            paramStr.push(`${key}=${encodeMessage(params[key])}`);
        }
        xhr.send(paramStr.join('&'));
    });
}