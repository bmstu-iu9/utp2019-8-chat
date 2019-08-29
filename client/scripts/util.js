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

const apiCheckToken = () => {
    return new Promise((resolve, reject) => {
        const accessToken = getCookie("accessToken");
        if (accessToken === undefined) {
            return reject("Access token did not found");
        }
        request("api/check_token", { token: accessToken })
            .then((res) => {
                const response = JSON.parse(res.response);
                if (response.success)
                    return resolve(response.userID);
                else
                    return reject(`Wrong access token: ${response.err_cause}`);
            })
            .catch((err) => {
                return reject(err);
            });
    });
}

const checkLogin = (login) => {
    const len = login.length;
    if (len < 1 && len > 20) {
        return false;
    }
    for (let i = 0; i < len; i++) {
        if ((login[i] < 'A' || login[i] > 'Z') &&
            (login[i] < 'a' || login[i] > 'z') &&
            (login[i] < '0' || login[i] > '9') &&
            login[i] != '_' && login[i] != '.' &&
            login[i] != '-' && login[i] != ' ') {
            return false;
        }
    }
    return true;
}

const checkPassword = (password) => {
    let b1 = false;
    let b2 = false;
    const len = password.length;
    if (len > 5) {  
        let i = 0;
        for (let i = 0; (!b1 || !b2) && i < len; i++) {
            if (!b1 && (password[i] >= 'A' && password[i] <= 'Z' ||
             password[i] >= 'a' && password[i] <= 'z')) {
                b1 = true;
            }
            else if (!b2 && password[i] >= '0' && password[i] <= '9') {
                b2 = true;
            }
        }
    }
    return b1 && b2;
}