'use-strict'

const fs = require("fs");
const crypto = require("crypto");
const mysql = require("mysql");

const PBKDF2_ITERATIONS = 100000;
const PBKDF2_LENGTH = 64; //In bytes
const MAX_SESSION_TIME = 180; //In minutes

let data = new Map(); //login -> user
let sessions = new Map();

let localParam;

const db = mysql.createConnection({
    host: 'remotemysql.com',
    user: '9SpT1uQOyM',
    password: 'utp2019password',
    database: '9SpT1uQOyM'
});

db.connect((err) => {
    if (err) {
        console.log("Connection error");
        throw err;
    }
    console.log("Connected");
});

module.exports.init = (local_param, database) => {
    localParam = local_param;

    this.register = register = async (login, password) => {
        const salt = crypto.randomBytes(32).toString("base64");
        const pwdHash = crypto.pbkdf2Sync(password, salt + localParam, PBKDF2_ITERATIONS, PBKDF2_LENGTH, "sha512");
        if (!await database.doesUserExist(login)){
            return { success: false, err_code: 3, err_cause: "User with this login already exists" };
        } else{
            let id = await database.addUser(login, pwdHash.toString('base64'), salt);
            const newUser = {
                login: login,
                id: id,
                hash: pwdHash.toString('base64'),
                salt: salt
         };
         return { success: true, id: newUser.id };
        }
    };

    this.auth = async (login, password) => {
        if (!await database.doesUserExist(login)){
            return { success: false, err_code: 7, err_cause: "user doesn't exist" };
        } else {
            const user = await database.getUser(login);
            const curHash = crypto.pbkdf2Sync(password, user.salt + localParam, PBKDF2_ITERATIONS, PBKDF2_LENGTH, "sha512");
            if (!crypto.timingSafeEqual(Buffer.from(user.hash, "base64"), curHash)) {
                return { success: false, err_code: 4, err_cause: "Wrong password" };
            } else{
                const sessionKey = crypto.randomBytes(64).toString("base64");
                sessions.set(sessionKey, {
                    token: sessionKey,
                    id: user.id,
                    lastUpdate: new Date().getTime()
                });
                return { success: true, token: sessionKey };
            }
        }
    }
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