'use-strict'

const fs = require("fs");
const crypto = require("crypto");

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_LENGTH = 64; //In bytes
const MAX_SESSION_TIME = 180; //In minutes

let data = [];
let sessions = [];

let localParam;

module.exports.init = (local_param) => {
    localParam = local_param;
}

module.exports.register = (login, password) => {
    for (let i = 0; i < data.length; i++) {
        if (data[i].login === login) {
            return { success: false, err_code: 3, err_cause: "user with this login already exists" };
        }
    }
    const salt = crypto.randomBytes(32).toString("base64");
    const pwdHash = crypto.pbkdf2Sync(password, salt + localParam, PBKDF2_ITERATIONS, PBKDF2_LENGTH, "sha512");
    data.push({
        login: login,
        id: data.length + 1,
        // hash: crypto.createHash("sha512").update(password + salt).digest("base64"),
        hash: pwdHash.toString('base64'),
        salt: salt
    });
    return { success: true, id: data.length };
}

module.exports.auth = (login, password) => {
    let user = undefined;
    for (let i = 0; i < data.length; i++) {
        if (data[i].login === login) {
            user = data[i];
            break;
        }
    }
    if (user === undefined) {
        return { success: false, err_code: 7, err_cause: "user doesn't exist" };
    }
    // const curHash = crypto.createHash("sha512").update(password + user.salt + localParam).digest("base64");
    const curHash = crypto.pbkdf2Sync(password, user.salt + localParam, PBKDF2_ITERATIONS, PBKDF2_LENGTH, "sha512");
    if (!crypto.timingSafeEqual(Buffer.from(user.hash, "base64"), curHash)) {
        return { success: false, err_code: 4, err_cause: "wrong password" };
    }
    let sessionKey = crypto.randomBytes(64).toString("base64");
    sessions[sessionKey] = {
        token: sessionKey,
        id: user.id,
        lastUpdate: new Date().getTime()
    };
    return { success: true, token: sessionKey };
}

module.exports.getUser = (token) => {
    if (sessions[token] === undefined) {
        return { success: false, err_code: 5, err_cause: "Wrong access token. Try to authorize again." };
    }
    let expire = new Date().getTime() - sessions[token].lastUpdate;
    if (expire > MAX_SESSION_TIME * 60000) {
        if (expire > 240 * 60000) { //Removing old sessions
            delete sessions[token];
        }
        return { success: false, err_code: 5, err_cause: "Access token expired. Try to authorize again." };
    }
    sessions[token].lastUpdate = new Date().getTime();
    return { success: true, userID: sessions[token].id };
}

module.exports.exitSession = (token) => {
    let auth = this.getUser(token);
    if (!auth.success) {
        return auth;
    }
    else {
        delete sessions[token];
        return { success: true };
    }
}

module.exports.exitAllSessions = (token) => {
    let auth = this.getUser(token);
    if (!auth.success) {
        return auth;
    }
    else {
        const id = sessions[token].id;
        for (let t in sessions) {
            if (sessions[t].id === id) {
                delete sessions[t];
            }
        }
        return { success: true };
    }
}

module.exports.save = (callback) => {
    fs.writeFile("./Data/auth.json", JSON.stringify(data), {}, (err) => {
        callback();
    });
}

module.exports.load = (callback) => {
    fs.readFile("./Data/auth.json", (err, raw) => {
        if (raw.length === 0) {
            callback();
            return;
        }
        data = JSON.parse(raw);
        callback();
    });
}
