'use-strict'

const crypto = require("crypto");

const MAX_SESSION_TIME = 180; //In minutes
const PBKDF2_ITERATIONS = 100000;
const PBKDF2_LENGTH = 64;

module.exports.init = (local_param, database) => {
    this.localParam = local_param;
    this.sessions = new Map();

    this.register = async (login, password) => {
        const salt = crypto.randomBytes(32).toString("base64");
        const pwdHash = crypto.pbkdf2Sync(password, salt + this.localParam, PBKDF2_ITERATIONS, PBKDF2_LENGTH, "sha512");
        if (await database.doesUserExist(login)) {
            return { success: false, err_code: 3, err_cause: "User with this login already exists" };
        }
        else {
            const id = await database.addUser(login, pwdHash.toString('base64'), salt);
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
        if (!await database.doesUserExist(login)) {
            return { success: false, err_code: 7, err_cause: "Wrong login or password" };
        }
        else {
            const user = await database.getUser(login);
            const curSalt = user.salt + this.localParam;
            const curHash = crypto.pbkdf2Sync(password, curSalt, PBKDF2_ITERATIONS, PBKDF2_LENGTH, "sha512");
            if (!crypto.timingSafeEqual(Buffer.from(user.hash, "base64"), curHash)) {
                return { success: false, err_code: 4, err_cause: "Wrong login or password" };
            }
            else {
                const sessionKey = crypto.randomBytes(64).toString("base64");
                this.sessions.set(sessionKey, {
                    token: sessionKey,
                    id: user.id,
                    lastUpdate: new Date().getTime()
                });
                return { success: true, token: sessionKey };
            }
        }
    }

    this.getUser = (token) => {
        const session = this.sessions.get(token);
        if (session === undefined) {
            return { success: false, err_code: 5, err_cause: "Wrong access token. Try to authorize again." };
        }
        const expire = new Date().getTime() - session.lastUpdate;
        if (expire > MAX_SESSION_TIME * 60000) {
            this.sessions.delete(token);
            return { success: false, err_code: 5, err_cause: "Access token expired. Try to authorize again." };
        }
        session.lastUpdate = new Date().getTime();
        return { success: true, userID: session.id };
    }

    this.exitSession = (token) => {
        const auth = this.getUser(token);
        if (!auth.success)
            return auth;
        else {
            this.sessions.delete(token);
            return { success: true };
        }
    }

    this.exitAllSessions = (token) => {
        const auth = this.getUser(token);
        if (!auth.success)
            return auth;
        else {
            const id = this.sessions.get(token).id;
            for (let t of this.sessions.entries())
                if (t[1].id === id)
                    this.sessions.delete(t[0]);
            return { success: true };
        }
    }
}