'use-strict'

const crypto = require("crypto");

const MAX_SESSION_TIME = 180; //In minutes

let data = [];
let sessions = [];

module.exports.register = (login, password) => {
    for (let i = 0; i < data.length; i++) {
        if (data[i].login === login) {
            return { success: false, err_code: 3, err_cause: "user with this login already exists" };
        }
    }
    data.push({
        login: login,
        id: data.length + 1,
        hash: crypto.createHash("sha512").update(password).digest("base64")
    });
    return { success: true, id: data.length };
}

module.exports.auth = (login, password) => {
    let current = undefined;
    for (let i = 0; i < data.length; i++) {
        if (data[i].login === login) {
            current = data[i];
            break;
        }
    }
    if (current === undefined) {
        return { success: false, err_code: 7, err_cause: "user doesn't exist" };
    }
    if (current.hash !== crypto.createHash("sha512").update(password).digest("base64")) {
        return { success: false, err_code: 4, err_cause: "wrong password" };
    }
    let sessionKey = crypto.randomBytes(64).toString("base64");
    sessions[sessionKey] = {
        token: sessionKey,
        id: current.id,
        lastUpdate: new Date().getTime()
    };
    return { success: true, token: sessionKey };
}

module.exports.getUser = (token) => {
    if (sessions[token] === undefined) {
        return { success: false, err_code: 5, err_cause: "Wrong access token. Try to authorize again." };
    }
    if (new Date().getTime() - sessions[token].lastUpdate > MAX_SESSION_TIME * 60000) {
        return { success: false, err_code: 5, err_cause: "Access token expired. Try to authorize again." };
    }
    sessions[token].lastUpdate = new Date().getTime();
    return { success: true, userID: sessions[token].id };
}


module.exports.load = () => {

}

module.exports.save = () => {

}