'use-strict'

const fs = require("fs");
const crypto = require("crypto");

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_LENGTH = 64; //In bytes
const MAX_SESSION_TIME = 180; //In minutes

let data = new Map(); //login -> user
let sessions = new Map();

let localParam;

module.exports.init = (local_param) => {
    localParam = local_param;
}

module.exports.register = (login, password) => {
    if (data.has(login))
        return { success: false, err_code: 3, err_cause: "User with this login already exists" };
    const salt = crypto.randomBytes(32).toString("base64");
    const pwdHash = crypto.pbkdf2Sync(password, salt + localParam, PBKDF2_ITERATIONS, PBKDF2_LENGTH, "sha512");
    const newUser = {
        login: login,
        id: data.size + 1,
        hash: pwdHash.toString('base64'),
        salt: salt
    };
    data.set(login, newUser)
    return { success: true, id: newUser.id };
}

module.exports.auth = (login, password) => {
    const user = data.get(login);
    if (user === undefined)
        return { success: false, err_code: 7, err_cause: "user doesn't exist" };
    const curHash = crypto.pbkdf2Sync(password, user.salt + localParam, PBKDF2_ITERATIONS, PBKDF2_LENGTH, "sha512");
    if (!crypto.timingSafeEqual(Buffer.from(user.hash, "base64"), curHash)) {
        return { success: false, err_code: 4, err_cause: "Wrong password" };
    }
    const sessionKey = crypto.randomBytes(64).toString("base64");
    sessions.set(sessionKey, {
        token: sessionKey,
        id: user.id,
        lastUpdate: new Date().getTime()
    });
    return { success: true, token: sessionKey };
}

module.exports.getUser = (token) => {
    const session = sessions.get(token);
    if (session === undefined) {
        return { success: false, err_code: 5, err_cause: "Wrong access token. Try to authorize again." };
    }
    let expire = new Date().getTime() - session.lastUpdate;
    if (expire > MAX_SESSION_TIME * 60000) {
        sessions.delete(token);
        return { success: false, err_code: 5, err_cause: "Access token expired. Try to authorize again." };
    }
    session.lastUpdate = new Date().getTime();
    return { success: true, userID: session.id };
}

module.exports.exitSession = (token) => {
    let auth = this.getUser(token);
    if (!auth.success) {
        return auth;
    }
    else {
        sessions.delete(token);
        return { success: true };
    }
}

module.exports.exitAllSessions = (token) => {
    let auth = this.getUser(token);
    if (!auth.success) {
        return auth;
    }
    else {
        const id = sessions.get(token).id;
        for (let t in sessions.entries())
            if (t[1].id === id)
                sessions.delete(t[0]);
        return { success: true };
    }
}

module.exports.save = async () => {
    return new Promise((resolve, reject) => {
        fs.writeFile("./Data/auth.json", JSON.stringify(Array.from(data.entries())), {}, (err) => {
            if (err)
                return reject(err);
            else
                return resolve();
        });
    });
}

module.exports.load = async () => {
    return new Promise((resolve, reject) => {
        fs.readFile("./Data/auth.json", (err, raw) => {
            if (err)
                return reject(err);
            if (raw.length === 0)
                return resolve();
            data = new Map(JSON.parse(raw));
            return resolve();
        });
    });
}
